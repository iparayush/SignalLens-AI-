/**
 * SignalLens AI — Processing Pipeline Orchestrator
 *
 * Coordinates the full end-to-end signal analysis workflow:
 *   Parse → FFT/PSD → Classify → Demodulate → De-interleave → FEC → Correlate
 *
 * Confidence gating (PRD 4.1): each stage forwards a confidence/quality score.
 * Downstream stages only run if upstream confidence clears defined thresholds;
 * otherwise the field shows UNDETERMINED with a clear reason.
 *
 * Emits progress events for real-time UI updates.
 */

import { parseSignalFile, type ParsedSignalFile, type SampleFormat } from './fileParser';
import { welchPSD, findPeaks, estimateBandwidth3dB, estimateSNR } from './dsp/fft';
import { computeSpectrogram, type SpectrogramResult } from './dsp/spectrogram';
import { analyzeSignalMetrics, type SignalMetrics } from './dsp/signalMetrics';
import { demodulate, type DemodulationResult, type ModulationScheme } from './dsp/demodulator';
import { tryAllDeinterleavers, deinterleave, type DeinterleaveResult, type DeinterleaverType } from './dsp/deinterleaver';
import { tryAllFecFamilies, fecDecode, type FecResult, type FecType } from './dsp/fec';
import { autoCorrelate, correlateStream, type CorrelationResult, KNOWN_SYNC_PATTERNS } from './dsp/correlator';
import { classifyModulation, type ClassificationResult } from './ml/modulationClassifier';
import type { PipelineThresholds } from '../types';

// ─── Pipeline Types ──────────────────────────────────────────────────────────

export type PipelineStage =
  | 'idle'
  | 'parsing'
  | 'spectral'
  | 'classifying'
  | 'demodulating'
  | 'deinterleaving'
  | 'fec_decoding'
  | 'correlating'
  | 'complete'
  | 'error';

export interface PipelineProgress {
  stage: PipelineStage;
  stageLabel: string;
  percent: number;
  message: string;
}

export interface PipelineConfig {
  /** FFT size for spectral analysis */
  fftSize: number;
  /** Window function for FFT */
  windowType: 'hamming' | 'blackman-harris' | 'hann' | 'flat-top';
  /** Manually override sample rate (0 = auto-detect from file) */
  overrideSampleRate: number;
  /** Manually override sample format */
  overrideSampleFormat?: SampleFormat;
  /** Modulation scheme override (null = auto-classify) */
  overrideModulation: ModulationScheme | null;
  /** De-interleaver type */
  deinterleaverType: DeinterleaverType;
  /** FEC type */
  fecType: FecType;
  /** Correlation pattern (null = auto-detect) */
  correlationPattern: string | null;
  /** Confidence gating thresholds (4.1) */
  thresholds: PipelineThresholds;
}

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  fftSize: 4096,
  windowType: 'blackman-harris',
  overrideSampleRate: 0,
  overrideModulation: null,
  deinterleaverType: 'block',
  fecType: 'viterbi',
  correlationPattern: null,
  thresholds: {
    maxEvmPct: 30,
    minModConfidence: 70,
    minSyncMatchLengthBytes: 4,
  },
};

export interface PipelineResults {
  /** Parsed file data */
  parsed: ParsedSignalFile;
  /** PSD spectrum in dB */
  psd: Float64Array;
  /** Spectrogram for waterfall */
  spectrogram: SpectrogramResult;
  /** Signal metrics */
  metrics: SignalMetrics;
  /** Modulation classification */
  classification: ClassificationResult;
  /** Demodulation results */
  demodulation: DemodulationResult;
  /** De-interleaving results (best candidate) */
  deinterleave: DeinterleaveResult;
  /** All de-interleaver candidates tried, sorted by score (4.10) */
  deinterleaveCandidates: DeinterleaveResult[];
  /** FEC decode results (best candidate) */
  fec: FecResult;
  /** All FEC family candidates tried, sorted by score (4.11) */
  fecCandidates: FecResult[];
  /** Correlation results */
  correlation: CorrelationResult;
  /** Whether FEC/deinterleave were gated out by confidence (4.1) */
  stagesGated: boolean;
  /** Human-readable reason for gating, if any */
  gatingReason: string;
  /** Total processing time (ms) */
  totalTimeMs: number;
  /** Per-stage timing */
  stageTiming: Record<string, number>;
}

// ─── Pipeline Runner ─────────────────────────────────────────────────────────

/**
 * Run the full signal analysis pipeline.
 *
 * @param file            — Input file (File object from drag/drop)
 * @param config          — Pipeline configuration
 * @param onProgress      — Callback for progress updates
 * @returns               — Complete analysis results
 */
export async function runPipeline(
  file: File,
  config: PipelineConfig = DEFAULT_PIPELINE_CONFIG,
  onProgress?: (progress: PipelineProgress) => void
): Promise<PipelineResults> {
  const startTime = performance.now();
  const stageTiming: Record<string, number> = {};
  const { thresholds } = config;

  const report = (stage: PipelineStage, label: string, percent: number, message: string) => {
    onProgress?.({ stage, stageLabel: label, percent, message });
  };

  // ── Stage 1: File Parsing ──────────────────────────────────────────────
  report('parsing', 'File Parsing', 5, `Reading ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`);
  let stageStart = performance.now();

  const sampleRate = config.overrideSampleRate > 0 ? config.overrideSampleRate : undefined;
  const parsed = await parseSignalFile(file, sampleRate, config.overrideSampleFormat);

  stageTiming['parsing'] = performance.now() - stageStart;
  report('parsing', 'File Parsing', 15, `Parsed ${parsed.numSamples.toLocaleString()} complex samples @ ${(parsed.sampleRate / 1e6).toFixed(3)} MSps`);

  // ── Stage 2: Spectral Analysis (always runs — independent of gating per 4.8) ──
  report('spectral', 'Spectral Analysis', 20, 'Computing Welch PSD estimate...');
  stageStart = performance.now();

  const psd = welchPSD(parsed.iq, config.fftSize, 0.5, config.windowType);
  const spectrogram = computeSpectrogram(parsed.iq, parsed.sampleRate, Math.min(config.fftSize, 1024), 0.5, config.windowType, 256);
  const metrics = analyzeSignalMetrics(parsed.iq, parsed.sampleRate, config.fftSize, config.windowType);

  stageTiming['spectral'] = performance.now() - stageStart;
  report('spectral', 'Spectral Analysis', 35, `SNR: +${metrics.estimatedSnrDb.toFixed(1)} dB, BW: ${formatBandwidth(metrics.estimatedBandwidthHz)}`);

  // ── Stage 3: Modulation Classification ─────────────────────────────────
  report('classifying', 'Modulation Classification', 40, 'Running cumulant-based classifier...');
  stageStart = performance.now();

  const classification = classifyModulation(parsed.iq, parsed.sampleRate);

  stageTiming['classifying'] = performance.now() - stageStart;
  report('classifying', 'Modulation Classification', 50, `Detected: ${classification.detected} (${classification.confidence.toFixed(1)}% confidence)`);

  // ── Stage 4: Demodulation ──────────────────────────────────────────────
  const modScheme = config.overrideModulation || mapToModulationScheme(classification.detected);
  const symbolRate = metrics.estimatedSymbolRateHz > 0 ? metrics.estimatedSymbolRateHz : parsed.sampleRate / 4;

  report('demodulating', 'Demodulation', 55, `Demodulating as ${modScheme} @ ${formatSymbolRate(symbolRate)}...`);
  stageStart = performance.now();

  const demodulation = demodulate(parsed.iq, parsed.sampleRate, symbolRate, modScheme);

  stageTiming['demodulating'] = performance.now() - stageStart;
  report('demodulating', 'Demodulation', 65, `Recovered ${demodulation.numBits} bits, EVM: ${demodulation.evmRms.toFixed(1)}%`);

  // ── Confidence Gate Check (PRD 4.1) ─────────────────────────────────────
  const evmOk = demodulation.evmRms < thresholds.maxEvmPct;
  const modConfOk = classification.confidence > thresholds.minModConfidence;
  const gatingPassed = evmOk && modConfOk;

  let gatingReason = '';
  if (!gatingPassed) {
    const reasons: string[] = [];
    if (!evmOk) {
      reasons.push(`EVM ${demodulation.evmRms.toFixed(1)}% ≥ threshold ${thresholds.maxEvmPct}%`);
    }
    if (!modConfOk) {
      reasons.push(`modulation confidence ${classification.confidence.toFixed(1)}% < threshold ${thresholds.minModConfidence}%`);
    }
    gatingReason = `Upstream stage below confidence threshold: ${reasons.join('; ')}. De-interleaving and FEC not attempted.`;
    report('deinterleaving', 'De-interleaving', 72, `GATED — ${gatingReason}`);
    report('fec_decoding', 'FEC Decoding', 80, `GATED — ${gatingReason}`);
  }

  // ── Stage 5: De-interleaving (gated) ──────────────────────────────────
  let deinterleaveResult: DeinterleaveResult;
  let deinterleaveCandidates: DeinterleaveResult[];

  if (gatingPassed) {
    report('deinterleaving', 'De-interleaving', 70, `Trying all 4 de-interleaver architectures...`);
    stageStart = performance.now();

    deinterleaveCandidates = tryAllDeinterleavers(demodulation.bits, 16, 32);
    deinterleaveResult = deinterleaveCandidates[0]; // Best candidate

    stageTiming['deinterleaving'] = performance.now() - stageStart;
    report('deinterleaving', 'De-interleaving', 78, `Best: ${deinterleaveResult.label} (score ${(deinterleaveResult.score * 100).toFixed(1)})`);
  } else {
    // Create UNDETERMINED sentinel
    const emptyBytes = new Uint8Array(0);
    deinterleaveResult = {
      data: emptyBytes,
      type: 'block',
      label: 'UNDETERMINED',
      params: 'N/A — upstream gate failed',
      burstErrorsDispersed: 0,
      processingTimeMs: 0,
      score: 0,
      undetermined: true,
      undeterminedReason: gatingReason,
    };
    deinterleaveCandidates = [deinterleaveResult];
    stageTiming['deinterleaving'] = 0;
  }

  // ── Stage 6: FEC Decoding (gated) ─────────────────────────────────────
  let fecResult: FecResult;
  let fecCandidates: FecResult[];

  if (gatingPassed && deinterleaveResult.data.length > 0) {
    report('fec_decoding', 'FEC Decoding', 80, `Trying all 4 FEC families...`);
    stageStart = performance.now();

    fecCandidates = tryAllFecFamilies(deinterleaveResult.data, '1/2');
    fecResult = fecCandidates[0]; // Best candidate

    stageTiming['fec_decoding'] = performance.now() - stageStart;
    report('fec_decoding', 'FEC Decoding', 88, `Best: ${fecResult.label} (score ${(fecResult.score * 100).toFixed(1)}, corrected ${fecResult.errorsCorrected} errors)`);
  } else {
    // Create UNDETERMINED sentinel
    fecResult = {
      data: new Uint8Array(0),
      errorsCorrected: 0,
      uncorrectedFrames: 0,
      codingGainDb: 0,
      type: 'viterbi',
      label: 'UNDETERMINED',
      config: 'N/A — upstream gate failed',
      processingTimeMs: 0,
      crcValid: false,
      score: 0,
      undetermined: true,
      undeterminedReason: gatingReason,
    };
    fecCandidates = [fecResult];
    stageTiming['fec_decoding'] = 0;
  }

  // ── Stage 7: Correlation ─────────────────────────────────────────────
  report('correlating', 'Bit Stream Correlation', 90, 'Searching for sync patterns...');
  stageStart = performance.now();

  // Correlate against the FEC output if available, else demod bits
  const correlateData = fecResult.data.length > 0 ? fecResult.data : demodulation.bits;

  let correlationResult: CorrelationResult;
  if (config.correlationPattern) {
    correlationResult = correlateStream(correlateData, config.correlationPattern);
  } else {
    const autoResult = autoCorrelate(correlateData);
    correlationResult = autoResult.result;
  }

  stageTiming['correlating'] = performance.now() - stageStart;
  report('correlating', 'Bit Stream Correlation', 98, `Found ${correlationResult.matches.length} pattern matches (significant: ${correlationResult.hasSignificantMatch})`);

  // ── Complete ───────────────────────────────────────────────────────────
  const totalTimeMs = performance.now() - startTime;
  report('complete', 'Analysis Complete', 100, `Full pipeline completed in ${totalTimeMs.toFixed(0)} ms`);

  return {
    parsed,
    psd,
    spectrogram,
    metrics,
    classification,
    demodulation,
    deinterleave: deinterleaveResult,
    deinterleaveCandidates,
    fec: fecResult,
    fecCandidates,
    correlation: correlationResult,
    stagesGated: !gatingPassed,
    gatingReason,
    totalTimeMs,
    stageTiming,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapToModulationScheme(detected: string): ModulationScheme {
  const map: Record<string, ModulationScheme> = {
    'BPSK': 'BPSK',
    'QPSK': 'QPSK',
    'QPSK (π/4)': 'QPSK',
    '8PSK': '8PSK',
    '16-QAM': '16-QAM',
    '64-QAM': '64-QAM',
    '256-QAM': '256-QAM',
    '2-FSK': '2-FSK',
    '4-FSK': '4-FSK',
    'GMSK': 'GMSK',
  };
  return map[detected] || 'QPSK';
}

/**
 * Auto-scale frequency for display (4.2). Never shows "0.000 MHz".
 */
export function formatFrequency(hz: number): string {
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(3)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(3)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)} kHz`;
  return `${hz.toFixed(0)} Hz`;
}

/**
 * Auto-scale symbol rate for display (4.2). Fixes "0.000 MSym/s" bug.
 */
export function formatSymbolRate(symHz: number): string {
  if (symHz >= 1e6) return `${(symHz / 1e6).toFixed(3)} MSym/s`;
  if (symHz >= 1e3) return `${(symHz / 1e3).toFixed(1)} kSym/s`;
  return `${symHz.toFixed(0)} Sym/s`;
}

/**
 * Auto-scale bandwidth for display (4.2). Fixes "0.000 MHz" bug.
 */
export function formatBandwidth(hz: number): string {
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(3)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)} kHz`;
  return `${hz.toFixed(0)} Hz`;
}

/**
 * Format file size.
 */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
  return `${bytes} B`;
}

/**
 * Format duration.
 */
export function formatDuration(seconds: number): string {
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(1)}s`;
  if (seconds >= 1) return `${seconds.toFixed(2)} s`;
  return `${(seconds * 1000).toFixed(1)} ms`;
}
