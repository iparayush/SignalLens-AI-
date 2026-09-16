import React, { useState, useCallback } from 'react';
import { NavigationTab, SignalProfile, ModulationType, ProcessingState, PipelineProgressInfo } from './types';
import { SAMPLE_SIGNALS } from './data/signals';
import { runPipeline, formatFrequency, formatFileSize, formatDuration, formatSymbolRate, formatBandwidth, DEFAULT_PIPELINE_CONFIG } from './lib/pipeline';
import type { PipelineResults, PipelineProgress } from './lib/pipeline';
import { computeThreatLevel } from './lib/threatScorer';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { UploadSignalView } from './components/UploadSignalView';
import { SignalAnalysisView } from './components/SignalAnalysisView';
import { DetectionResultsView } from './components/DetectionResultsView';
import { DemodulationView } from './components/DemodulationView';
import { DecodePipelineView } from './components/DecodePipelineView';
import { DecodeView } from './components/DecodeView';
import { BitStreamView } from './components/BitStreamView';
import { CorrelationView } from './components/CorrelationView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { ExportReportModal } from './components/ExportReportModal';

// ─── Map pipeline results to SignalProfile for backward-compat UI ────────────

function mapPipelineToProfile(
  file: File,
  results: PipelineResults
): SignalProfile {
  const { parsed, psd, spectrogram, metrics, classification, demodulation, deinterleave, deinterleaveCandidates, fec, fecCandidates, correlation, totalTimeMs, stagesGated, gatingReason } = results;

  const fsHz = parsed.sampleRate;
  const detectedMod = classification.detected as ModulationType;
  const constellationType =
    detectedMod === 'BPSK' ? 'BPSK' :
    detectedMod === '16-QAM' || detectedMod === '64-QAM' || detectedMod === '256-QAM' ? '16-QAM' :
    detectedMod === '2-FSK' || detectedMod === '4-FSK' || detectedMod === 'GMSK' ? 'FSK' :
    'QPSK';

  // Build bitstream lines from decoded data (4.12 — label header/payload)
  const bitstreamLines = [];
  const decodedBytes = fec.data.length > 0 ? fec.data : demodulation.bits;
  const frameLengthBytes = correlation.estimatedFrameLengthBytes;
  const hasSignificantMatch = correlation.hasSignificantMatch;

  for (let row = 0; row < Math.min(32, Math.ceil(decodedBytes.length / 16)); row++) {
    const offset = row * 16;
    const hexBytes: string[] = [];
    let ascii = '';
    for (let col = 0; col < 16 && offset + col < decodedBytes.length; col++) {
      const byte = decodedBytes[offset + col];
      hexBytes.push(byte.toString(16).padStart(2, '0').toUpperCase());
      ascii += (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
    }

    // 4.12: Segment labeling — only when sync match is significant
    let highlightCategory: 'header' | 'ip' | 'protocol' | 'payload' | undefined;
    if (hasSignificantMatch && row === 0) {
      highlightCategory = 'header';
    } else if (hasSignificantMatch && frameLengthBytes && offset <= frameLengthBytes) {
      highlightCategory = 'payload';
    }

    bitstreamLines.push({
      offset: `0x${offset.toString(16).padStart(4, '0').toUpperCase()}`,
      hexBytes,
      ascii,
      highlightCategory,
    });
  }

  // Map correlation results (4.4 — significance tracking)
  const bestMatch = correlation.matches.find(m => m.isSignificant) || correlation.matches[0];
  const syncMatchLengthBytes = bestMatch?.patternLengthBytes ?? 0;
  const correlationData = {
    patternName: bestMatch?.patternName || 'No Pattern',
    syncPreambleHex: bestMatch?.matchedHex || 'N/A',
    detectedPositionOffset: bestMatch ? `Byte ${bestMatch.byteOffset}` : 'No Match',
    bitLocation: bestMatch ? `Bit ${bestMatch.bitOffset}` : 'N/A',
    confidence: bestMatch?.confidence || 0,
    crossCorrPsrDb: correlation.bestPsrDb,
    noiseFloorDb: metrics.noiseFloorDb,
    detThresholdDb: -12,
    crossCorrLength: correlation.correlationWaveform.length,
    peakToSidelobeStatus: (correlation.bestPsrDb > 10 ? 'PASS' : correlation.bestPsrDb > 5 ? 'WARN' : 'FAIL') as 'PASS' | 'WARN' | 'FAIL',
    hasSignificantMatch,
    syncMatchLengthBytes,
  };

  // Threat level — confidence-gated (4.6)
  const threatLevel = computeThreatLevel({
    overallConfidence: metrics.overallConfidence,
    hasSignificantMatch,
    snrDb: metrics.estimatedSnrDb,
    modConfidence: classification.confidence,
    evmRms: demodulation.evmRms,
    fecUndetermined: fec.undetermined === true,
  });

  // Pipeline stages — show UNDETERMINED states (4.1)
  const stageTiming = results.stageTiming;
  const pipelineStages = [
    {
      id: 'parse', stepNum: '01', title: 'File Parsing & Validation',
      statusText: `${parsed.numSamples.toLocaleString()} samples parsed`,
      isPassed: parsed.isValid, iconName: 'FileCheck',
      description: parsed.validationMessages.join(' • '),
      metaLeft: `${parsed.sampleFormat.toUpperCase()} ${parsed.bitsPerSample}-bit`,
      metaRight: `${(stageTiming['parsing'] || 0).toFixed(0)} ms`,
    },
    {
      id: 'spectral', stepNum: '02', title: 'Spectral Analysis & PSD',
      statusText: `SNR: +${metrics.estimatedSnrDb.toFixed(1)} dB (${metrics.snrQuality})`,
      isPassed: true, iconName: 'Activity',
      description: `Welch PSD with ${DEFAULT_PIPELINE_CONFIG.fftSize}-point ${DEFAULT_PIPELINE_CONFIG.windowType} FFT`,
      metaLeft: `BW: ${formatBandwidth(metrics.estimatedBandwidthHz)}`,
      metaRight: `${(stageTiming['spectral'] || 0).toFixed(0)} ms`,
    },
    {
      id: 'classify', stepNum: '03', title: 'Modulation Classification',
      statusText: `${classification.detected} (${classification.confidence.toFixed(1)}%)`,
      isPassed: classification.confidence > 50, iconName: 'Cpu',
      description: 'Higher-order cumulant analysis with softmax classifier',
      metaLeft: `Kurtosis: ${classification.features.kurtosis.toFixed(3)}`,
      metaRight: `${(stageTiming['classifying'] || 0).toFixed(0)} ms`,
    },
    {
      id: 'demod', stepNum: '04', title: 'Demodulation',
      statusText: demodulation.carrierLocked
        ? `${demodulation.numBits} bits recovered`
        : `UNLOCKED — EVM ${demodulation.evmRms.toFixed(1)}% ≥ ${DEFAULT_PIPELINE_CONFIG.thresholds.maxEvmPct}% threshold`,
      isPassed: demodulation.carrierLocked, iconName: 'Radio',
      description: `${demodulation.modulation} demod, EVM: ${demodulation.evmRms.toFixed(1)}%, Phase Jitter: ${demodulation.phaseJitterDeg.toFixed(1)}°`,
      metaLeft: `Carrier ${demodulation.carrierLocked ? 'LOCKED' : 'UNLOCKED'}`,
      metaRight: `${(stageTiming['demodulating'] || 0).toFixed(0)} ms`,
    },
    {
      id: 'deinterleave', stepNum: '05', title: 'De-interleaving',
      statusText: deinterleave.undetermined
        ? 'UNDETERMINED — upstream gate failed'
        : `${deinterleave.label} (score ${(deinterleave.score * 100).toFixed(0)}%)`,
      isPassed: !deinterleave.undetermined, iconName: 'Grid',
      description: deinterleave.undetermined
        ? `Not attempted: ${deinterleave.undeterminedReason}`
        : deinterleave.params,
      metaLeft: deinterleave.undetermined ? 'N/A' : `Dispersed: ${deinterleave.burstErrorsDispersed}`,
      metaRight: `${(stageTiming['deinterleaving'] || 0).toFixed(0)} ms`,
    },
    {
      id: 'fec', stepNum: '06', title: 'FEC Decode',
      statusText: fec.undetermined
        ? 'UNDETERMINED — upstream gate failed'
        : `${fec.errorsCorrected} errors corrected`,
      isPassed: !fec.undetermined, iconName: 'Shield',
      description: fec.undetermined
        ? `Not attempted: ${fec.undeterminedReason}`
        : fec.config,
      metaLeft: fec.undetermined ? 'N/A' : `Gain: ${fec.codingGainDb.toFixed(1)} dB`,
      metaRight: `${fec.processingTimeMs.toFixed(0)} ms`,
    },
  ];

  // RF Center Frequency vs Residual Carrier Offset (4.3)
  // parsed.centerFrequencyHz comes from file metadata if present (WAV/SigMF header)
  const rfCenterFreqHz = (parsed as any).centerFrequencyHz as number | undefined;
  const residualCarrierOffsetHz = metrics.centerFreqHz;

  return {
    id: `computed-${Date.now()}`,
    filename: file.name,
    fileFormat: `.${file.name.split('.').pop()?.toUpperCase() || 'IQ'}`,
    fileSizeBytes: file.size,
    sizeFormatted: formatFileSize(file.size),
    durationSeconds: parsed.durationSeconds,
    durFormatted: formatDuration(parsed.durationSeconds),
    samplingRateMSps: fsHz / 1e6,
    fsFormatted: formatFrequency(fsHz),
    centerCarrierMHz: rfCenterFreqHz ? rfCenterFreqHz / 1e6 : residualCarrierOffsetHz / 1e6,
    fcFormatted: rfCenterFreqHz ? formatFrequency(rfCenterFreqHz) : `${formatFrequency(residualCarrierOffsetHz)} (residual offset)`,
    channel: rfCenterFreqHz ? `CH-${Math.floor(rfCenterFreqHz / 1e6)}` : 'CH-UNKNOWN',
    formatDescription: `${parsed.sampleFormat.toUpperCase()} ${parsed.bitsPerSample}-bit Complex I/Q`,
    crc32: parsed.crc32,
    telemetry: {
      modulation: detectedMod,
      modulationMatch: classification.confidence,
      samplingFreqMHz: fsHz / 1e6,
      samplingFreqConfidence: 100,
      symbolRateMSym: metrics.estimatedSymbolRateHz / 1e6,
      symbolRateHz: metrics.estimatedSymbolRateHz,
      symbolRateConfidence: metrics.symbolRateConfidence,
      bandwidthMHz: metrics.estimatedBandwidthHz / 1e6,
      bandwidthHz: metrics.estimatedBandwidthHz,
      bandwidthConfidence: metrics.bandwidthConfidence,
      fecCode: fec.undetermined ? 'UNDETERMINED' : fec.config,
      fecDetected: !fec.undetermined,
      fecUndetermined: fec.undetermined === true,
      fecUndeterminedReason: fec.undeterminedReason || '',
      interleaving: deinterleave.undetermined ? 'UNDETERMINED' : deinterleave.params,
      interleavingConfidence: deinterleave.undetermined ? 0 : Math.round(deinterleave.score * 100),
      interleavingUndetermined: deinterleave.undetermined === true,
      interleavingUndeterminedReason: deinterleave.undeterminedReason || '',
      estimatedSnrDb: metrics.estimatedSnrDb,
      snrQuality: metrics.snrQuality,
      centerCarrierMHz: rfCenterFreqHz ? rfCenterFreqHz / 1e6 : residualCarrierOffsetHz / 1e6,
      carrierLocked: metrics.carrierLocked,
      overallConfidence: metrics.overallConfidence,
      algorithm: 'Cumulant Classifier + Costas Loop DSP',
      inferenceComputeMs: totalTimeMs,
    },
    pipelineStages,
    bitstreamLines,
    correlation: correlationData,
    rawSampleBytes: Array.from(decodedBytes.slice(0, 256)),
    constellationType,
    evmRms: demodulation.evmRms,
    phaseJitterDeg: demodulation.phaseJitterDeg,
    emitterProfile: {
      callsign: `SIG-${file.name.slice(0, 6).toUpperCase()}`,
      classification: 'SIGINT — Automated Intercept',
      // 4.5 — No geolocation from single-sensor capture
      locationNote: 'Not determinable from single-sensor capture',
      estimatedLocation: 'Not determinable from single-sensor capture',
      coordinates: undefined,
      threatLevel,
      targetDesignation: `TARGET-${file.name.replace(/\.[^/.]+$/, '').toUpperCase()}`,
    },

    // 4.3 — Separate RF center freq from residual offset
    rfCenterFreqHz,
    residualCarrierOffsetHz,

    // Real computed data
    isComputed: true,
    rawIQ: parsed.iq,
    psdSpectrum: psd,
    spectrogramData: spectrogram,
    signalMetrics: metrics,
    classificationResult: classification,
    demodulationResult: demodulation,
    deinterleaveResult: deinterleave,
    deinterleaveCandidates,
    fecResult: fec,
    fecCandidates,
    correlationResult: correlation,
    pipelineResults: results,
    processingTimeMs: totalTimeMs,
    pipelineThresholds: results.parsed ? DEFAULT_PIPELINE_CONFIG.thresholds : undefined,
  };
}

// ─── App Component ───────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [signalsList, setSignalsList] = useState<SignalProfile[]>(SAMPLE_SIGNALS);
  const [activeSignal, setActiveSignal] = useState<SignalProfile>(SAMPLE_SIGNALS[0]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [pipelineProgress, setPipelineProgress] = useState<PipelineProgressInfo>({
    stage: 'idle', stageLabel: '', percent: 0, message: '',
  });

  const handleUpdateModulation = (mod: ModulationType) => {
    setActiveSignal((prev) => ({
      ...prev,
      telemetry: {
        ...prev.telemetry,
        modulation: mod,
      },
    }));
  };

  // Real file upload processor — runs the full DSP pipeline
  const handleFileUpload = useCallback(async (file: File) => {
    setProcessingState('processing');
    setPipelineProgress({
      stage: 'parsing', stageLabel: 'Initializing', percent: 0,
      message: `Loading ${file.name}...`,
    });
    setActiveTab('dashboard');

    try {
      const results = await runPipeline(
        file,
        DEFAULT_PIPELINE_CONFIG,
        (progress: PipelineProgress) => {
          setPipelineProgress({
            stage: progress.stage,
            stageLabel: progress.stageLabel,
            percent: progress.percent,
            message: progress.message,
          });
        }
      );

      const computedProfile = mapPipelineToProfile(file, results);
      setSignalsList((prev) => [computedProfile, ...prev]);
      setActiveSignal(computedProfile);
      setProcessingState('complete');
    } catch (err) {
      console.error('Pipeline error:', err);
      setProcessingState('error');
      setPipelineProgress({
        stage: 'error', stageLabel: 'Error', percent: 0,
        message: `Processing failed: ${err instanceof Error ? err.message : String(err)}`,
      });

      // Fallback: create a basic profile from file metadata
      const fallback: SignalProfile = {
        ...SAMPLE_SIGNALS[0],
        id: `fallback-${Date.now()}`,
        filename: file.name,
        fileSizeBytes: file.size,
        sizeFormatted: formatFileSize(file.size),
        emitterProfile: {
          ...SAMPLE_SIGNALS[0].emitterProfile,
          callsign: `ERR-${file.name.slice(0, 6).toUpperCase()}`,
          targetDesignation: `TARGET-${file.name.replace(/\.[^/.]+$/, '').toUpperCase()}`,
        },
      };
      setSignalsList((prev) => [fallback, ...prev]);
      setActiveSignal(fallback);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e18] text-[#dfe2f1] font-body flex">
      {/* Fixed Left Tactical Navigation Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Operating Surface */}
      <div className="pl-72 flex flex-col flex-1 min-h-screen w-full">
        {/* Fixed Top Status & Command Header */}
        <Header
          activeSignal={activeSignal}
          signalsList={signalsList}
          onSelectSignal={setActiveSignal}
          onOpenExportModal={() => setExportModalOpen(true)}
        />

        {/* Pipeline Processing Progress Bar */}
        {processingState === 'processing' && (
          <div className="fixed top-14 left-72 right-0 z-40 bg-[#0a0e18]/95 backdrop-blur-sm border-b border-[#262a35] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs text-[#4cd7f6] font-bold uppercase tracking-wider">
                    ⟳ {pipelineProgress.stageLabel}
                  </span>
                  <span className="font-mono text-xs text-[#869397]">
                    {pipelineProgress.percent.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#171b26] rounded-full overflow-hidden border border-[#262a35]">
                  <div
                    className="h-full bg-gradient-to-r from-[#06b6d4] to-[#4edea3] rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${pipelineProgress.percent}%` }}
                  />
                </div>
                <p className="font-mono text-[10px] text-[#869397] mt-1">
                  {pipelineProgress.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Center Mission Surface */}
        <main className="flex-1 pt-20 pb-16 w-full bg-[#0f131d] px-4 min-h-screen">
          {activeTab === 'dashboard' && (
            <DashboardView
              activeSignal={activeSignal}
              onFileUpload={handleFileUpload}
            />
          )}

          {activeTab === 'upload-signal' && (
            <UploadSignalView
              activeSignal={activeSignal}
              signalsList={signalsList}
              onSelectSignal={setActiveSignal}
              onFileUpload={handleFileUpload}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'signal-analysis' && (
            <SignalAnalysisView activeSignal={activeSignal} />
          )}

          {activeTab === 'detection-results' && (
            <DetectionResultsView activeSignal={activeSignal} />
          )}

          {activeTab === 'demodulation' && (
            <DemodulationView
              activeSignal={activeSignal}
              onUpdateModulation={handleUpdateModulation}
            />
          )}

          {(activeTab === 'decode-pipeline' || activeTab === 'decode') && (
            <DecodePipelineView activeSignal={activeSignal} />
          )}

          {activeTab === 'bit-stream' && (
            <BitStreamView activeSignal={activeSignal} />
          )}

          {activeTab === 'correlation' && (
            <CorrelationView activeSignal={activeSignal} />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              activeSignal={activeSignal}
              onOpenExportModal={() => setExportModalOpen(true)}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Fixed Bottom Operations Status Ribbon */}
        <Footer />
      </div>

      {/* Export Intelligence Report Modal Dialog */}
      <ExportReportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        activeSignal={activeSignal}
      />
    </div>
  );
}
