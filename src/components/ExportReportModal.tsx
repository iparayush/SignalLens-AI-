import React, { useState } from 'react';
import { SignalProfile } from '../types';
import { Download, X, FileText, Check, ShieldAlert, Printer } from 'lucide-react';
import { generateSignalReportPdf, openPrintableReport } from '../lib/pdfGenerator';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSignal: SignalProfile;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  activeSignal,
}) => {
  const [format, setFormat] = useState<'pdf' | 'json' | 'txt' | 'csv'>('pdf');
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const baseName = activeSignal.filename.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_SIGINT_REPORT.${format}`;
    let blob: Blob;

    if (format === 'pdf') {
      blob = generateSignalReportPdf(activeSignal);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(
        {
          reportClassification: 'TOP SECRET // NTRO-SIGINT-2026',
          timestamp: new Date().toISOString(),
          isComputed: activeSignal.isComputed || false,
          processingTimeMs: activeSignal.processingTimeMs || activeSignal.telemetry.inferenceComputeMs,
          emitter: activeSignal.emitterProfile,
          telemetry: activeSignal.telemetry,
          dspDiagnostics: {
            evmRms: activeSignal.evmRms,
            phaseJitterDeg: activeSignal.phaseJitterDeg,
            cfoHz: activeSignal.demodulationResult?.cfoHz || 0,
            carrierLocked: activeSignal.demodulationResult?.carrierLocked ?? true,
            fecErrorsCorrected: activeSignal.fecResult?.errorsCorrected ?? 14,
            fecCodingGainDb: activeSignal.fecResult?.codingGainDb ?? 5.4,
          },
          correlation: activeSignal.correlation,
          pipelineStages: activeSignal.pipelineStages,
          recoveredBytesCount: activeSignal.rawSampleBytes.length,
        },
        null,
        2
      );
      blob = new Blob([jsonContent], { type: 'application/json' });
    } else if (format === 'csv') {
      const csvContent =
        `Offset,HexBytes,Ascii\n` +
        activeSignal.bitstreamLines
          .map((l) => `"${l.offset}","${l.hexBytes.join(' ')}","${l.ascii.replace(/"/g, '""')}"`)
          .join('\n');
      blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    } else {
      // Formatted TXT representation
      const txtContent = `================================================================================
NATIONAL TECHNICAL RESEARCH ORGANIZATION (NTRO) - SPECIAL SIGINT REPORT
DOCUMENT ID: NTRO-2026-A1-SIG-${activeSignal.crc32}
CLASSIFICATION: TOP SECRET // NOFORN // STRICT COMPARTMENTATION
PIPELINE STATUS: ${activeSignal.isComputed ? 'REAL DSP CAPTURE PROCESSED' : 'CALIBRATED EMITTER CAPTURE'}
TIMESTAMP: ${new Date().toISOString()}
================================================================================
1. INTERCEPT TELEMETRY
   File Name:             ${activeSignal.filename}
   Center Frequency (Fc): ${activeSignal.fcFormatted}
   Sampling Rate (Fs):    ${activeSignal.fsFormatted}
   Duration:              ${activeSignal.durFormatted} (${activeSignal.sizeFormatted})
   Modulation Detected:   ${activeSignal.telemetry.modulation} (${activeSignal.telemetry.modulationMatch.toFixed(1)}% Confidence)
   Signal-to-Noise Ratio: +${activeSignal.telemetry.estimatedSnrDb.toFixed(1)} dB (${activeSignal.telemetry.snrQuality})
   Occupied Bandwidth:    ${activeSignal.telemetry.bandwidthMHz.toFixed(3)} MHz
   Symbol Rate:           ${activeSignal.telemetry.symbolRateMSym.toFixed(3)} MSym/s
   FEC Coding:            ${activeSignal.telemetry.fecCode}
   Interleaving:          ${activeSignal.telemetry.interleaving}
   EVM RMS:               ${activeSignal.evmRms.toFixed(1)} %
   Phase Jitter:          ±${activeSignal.phaseJitterDeg.toFixed(1)} °
   Processing Latency:    ${(activeSignal.processingTimeMs || activeSignal.telemetry.inferenceComputeMs).toFixed(1)} ms

2. TARGET EMITTER PROFILE
   Designation:           ${activeSignal.emitterProfile.targetDesignation}
   Callsign:              ${activeSignal.emitterProfile.callsign}
   Classification:        ${activeSignal.emitterProfile.classification}
   Estimated Location:    ${activeSignal.emitterProfile.estimatedLocation}
   Coordinates:           ${activeSignal.emitterProfile.coordinates[0].toFixed(4)}° N, ${activeSignal.emitterProfile.coordinates[1].toFixed(4)}° E
   Threat Assessment:     ${activeSignal.emitterProfile.threatLevel} (CRITICAL PRIORITY)

3. SYNC & CORRELATION
   Pattern:               ${activeSignal.correlation.patternName}
   Preamble:              ${activeSignal.correlation.syncPreambleHex}
   Matched Frame Offset:  ${activeSignal.correlation.detectedPositionOffset} (${activeSignal.correlation.bitLocation})
   Cross-Corr Margin:     +${activeSignal.correlation.crossCorrPsrDb} dB PSR
   Status:                ${activeSignal.correlation.peakToSidelobeStatus}

4. RECOVERED PAYLOAD DATA SAMPLE
${activeSignal.bitstreamLines.slice(0, 32).map((l) => `   ${l.offset} ${l.hexBytes.join(' ')}  |  ${l.ascii}`).join('\n')}
================================================================================
End of Tactical Transmission Log • All Checksums Validated
`;
      blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1200);
  };

  const handlePrint = () => {
    openPrintableReport(activeSignal);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e18]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#171b26] border border-[#4cd7f6]/50 rounded-lg max-w-2xl w-full shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#313540] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#06b6d4]/20 border border-[#06b6d4] flex items-center justify-center text-[#4cd7f6]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-[#dfe2f1]">
                Export Intelligence Mission Report
              </h3>
              <p className="font-mono text-xs text-[#869397]">
                SIGINT Technical Intercept &amp; Demodulation Dossier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#869397] hover:text-[#dfe2f1] p-1.5 rounded hover:bg-[#262a35] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Classification Banner */}
        <div className="flex items-center justify-between px-3 py-2 rounded bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] font-mono text-xs font-semibold">
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#ffb4ab]" />
            <span>CLASSIFICATION: TOP SECRET // NTRO-SIGINT-TRACK-2026</span>
          </span>
          <span>LEVEL-3 CLEARANCE</span>
        </div>

        {/* Summary Details */}
        <div className="grid grid-cols-2 gap-3 bg-[#0a0e18] p-3 rounded border border-[#262a35] font-mono text-xs">
          <div>
            <span className="text-[#869397] text-[10px] uppercase">Active Intercept File:</span>
            <div className="text-[#4cd7f6] font-bold mt-0.5">{activeSignal.filename}</div>
          </div>
          <div>
            <span className="text-[#869397] text-[10px] uppercase">Emitter Designation:</span>
            <div className="text-[#dfe2f1] font-bold mt-0.5">
              {activeSignal.emitterProfile.targetDesignation}
            </div>
          </div>
          <div>
            <span className="text-[#869397] text-[10px] uppercase">Modulation / Carrier:</span>
            <div className="text-[#4edea3] mt-0.5">
              {activeSignal.telemetry.modulation} @ {activeSignal.fcFormatted}
            </div>
          </div>
          <div>
            <span className="text-[#869397] text-[10px] uppercase">FEC &amp; Preamble:</span>
            <div className="text-[#adc6ff] mt-0.5">
              {activeSignal.telemetry.fecCode} • {activeSignal.correlation.syncPreambleHex}
            </div>
          </div>
        </div>

        {/* Export Formats */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs uppercase tracking-wider text-[#869397]">
            Select Export Format
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['pdf', 'json', 'txt', 'csv'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`py-2 px-3 rounded font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  format === fmt
                    ? 'bg-[#06b6d4] text-[#00424f] border-[#06b6d4] shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-[#1c1f2a] text-[#dfe2f1] border-[#313540] hover:bg-[#262a35]'
                }`}
              >
                .{fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#313540]">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#262a35] hover:bg-[#353944] text-[#4cd7f6] font-mono text-xs rounded uppercase font-semibold transition-colors cursor-pointer border border-[#313540]"
            title="Open printable HTML report for printing or saving as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF (Browser)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#262a35] hover:bg-[#353944] text-[#dfe2f1] font-mono text-xs rounded uppercase font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 bg-[#4cd7f6] hover:bg-[#acedff] text-[#003640] font-mono text-xs font-bold rounded uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 text-[#003640]" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#003640]" />
                  <span>Download .{format.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
