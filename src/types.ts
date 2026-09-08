import type { PipelineResults } from './lib/pipeline';
import type { SpectrogramResult } from './lib/dsp/spectrogram';
import type { ClassificationResult } from './lib/ml/modulationClassifier';
import type { DemodulationResult } from './lib/dsp/demodulator';
import type { DeinterleaveResult } from './lib/dsp/deinterleaver';
import type { FecResult } from './lib/dsp/fec';
import type { CorrelationResult } from './lib/dsp/correlator';
import type { SignalMetrics } from './lib/dsp/signalMetrics';

export type NavigationTab =
  | 'dashboard'
  | 'upload-signal'
  | 'signal-analysis'
  | 'detection-results'
  | 'demodulation'
  | 'decode-pipeline'
  | 'bit-stream'
  | 'correlation'
  | 'reports'
  | 'settings';

export type ModulationCategory = 'PSK' | 'QAM' | 'FSK';

export type ModulationType =
  | 'QPSK'
  | 'BPSK'
  | '8PSK'
  | '16-QAM'
  | '64-QAM'
  | '256-QAM'
  | '2-FSK'
  | '4-FSK'
  | 'GMSK'
  | 'LoRa CSS';

export type DeinterleaverType = 'block' | 'convolutional' | 'diagonal' | 'pseudorandom';

export type FecType = 'viterbi' | 'reedsolomon' | 'concatenated' | 'ldpc';

/** Processing state for the pipeline */
export type ProcessingState = 'idle' | 'processing' | 'complete' | 'error';

/** Pipeline progress tracking */
export interface PipelineProgressInfo {
  stage: string;
  stageLabel: string;
  percent: number;
  message: string;
}

export interface TelemetryMetrics {
  modulation: ModulationType;
  modulationMatch: number; // e.g. 99.4
  samplingFreqMHz: number; // e.g. 2.400
  samplingFreqConfidence: number; // e.g. 100
  symbolRateMSym: number; // e.g. 1.200
  symbolRateConfidence: number; // e.g. 98.9
  bandwidthMHz: number; // e.g. 1.440
  bandwidthConfidence: number; // e.g. 99.1
  fecCode: string; // e.g. 'Viterbi K=7, R=1/2'
  fecDetected: boolean;
  interleaving: string; // e.g. 'Matrix 16x32 Block'
  interleavingConfidence: number; // e.g. 97.6
  estimatedSnrDb: number; // e.g. 24.8
  snrQuality: 'Optimal' | 'Good' | 'Degraded' | 'Marginal';
  centerCarrierMHz: number; // e.g. 433.920
  carrierLocked: boolean;
  overallConfidence: number; // e.g. 98.7
  algorithm: string;
  inferenceComputeMs: number;
}

export interface DSPPipelineStage {
  id: string;
  stepNum: string;
  title: string;
  statusText: string;
  isPassed: boolean;
  iconName: string;
  description: string;
  metaLeft: string;
  metaRight: string;
  details?: {
    heading: string;
    metrics: { label: string; value: string }[];
    summary: string;
  };
}

export interface BitStreamByte {
  offset: string;
  hexBytes: string[];
  ascii: string;
  isSpecial?: boolean;
  highlightCategory?: 'header' | 'ip' | 'protocol' | 'payload';
}

export interface CorrelationData {
  patternName: string;
  syncPreambleHex: string;
  detectedPositionOffset: string;
  bitLocation: string;
  confidence: number;
  crossCorrPsrDb: number;
  noiseFloorDb: number;
  detThresholdDb: number;
  crossCorrLength: number;
  peakToSidelobeStatus: 'PASS' | 'WARN' | 'FAIL';
}

export interface SignalProfile {
  id: string;
  filename: string;
  fileFormat: string;
  fileSizeBytes: number;
  sizeFormatted: string;
  durationSeconds: number;
  durFormatted: string;
  samplingRateMSps: number;
  fsFormatted: string;
  centerCarrierMHz: number;
  fcFormatted: string;
  channel: string;
  formatDescription: string;
  crc32: string;
  telemetry: TelemetryMetrics;
  pipelineStages: DSPPipelineStage[];
  bitstreamLines: BitStreamByte[];
  correlation: CorrelationData;
  rawSampleBytes: number[];
  constellationType: 'QPSK' | 'BPSK' | '16-QAM' | 'FSK';
  evmRms: number;
  phaseJitterDeg: number;
  emitterProfile: {
    callsign: string;
    classification: string;
    estimatedLocation: string;
    coordinates: [number, number];
    threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    targetDesignation: string;
  };

  // ── Real DSP computed data (populated after pipeline runs) ──

  /** Whether this profile has real computed data from the pipeline */
  isComputed?: boolean;

  /** Raw interleaved I/Q samples (Float64Array) */
  rawIQ?: Float64Array;

  /** PSD spectrum in dB */
  psdSpectrum?: Float64Array;

  /** Spectrogram data for waterfall */
  spectrogramData?: SpectrogramResult;

  /** Signal metrics from analysis */
  signalMetrics?: SignalMetrics;

  /** Modulation classification results */
  classificationResult?: ClassificationResult;

  /** Demodulation results */
  demodulationResult?: DemodulationResult;

  /** De-interleaving results */
  deinterleaveResult?: DeinterleaveResult;

  /** FEC decode results */
  fecResult?: FecResult;

  /** Correlation results */
  correlationResult?: CorrelationResult;

  /** Full pipeline results reference */
  pipelineResults?: PipelineResults;

  /** Total pipeline processing time (ms) */
  processingTimeMs?: number;
}
