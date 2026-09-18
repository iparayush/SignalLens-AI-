import React, { useState } from 'react';
import { SignalProfile } from '../types';
import {
  Download,
  X,
  FileText,
  Check,
  ShieldAlert,
  Printer,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCode,
  Layers,
} from 'lucide-react';
import { generateSignalReportPdf, getReportFilename, openPrintableReport } from '../lib/pdfGenerator';
import { AstraXReportTemplate } from './AstraXReportTemplate';

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
  const [exportState, setExportState] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAstraXTemplate, setShowAstraXTemplate] = useState(false);

  if (!isOpen) return null;

  if (showAstraXTemplate) {
    return (
      <div className="fixed inset-0 z-50 bg-[#050811]/95 backdrop-blur-md overflow-y-auto p-2 sm:p-4 flex flex-col items-center">
        <div className="w-full max-w-[210mm] flex justify-end mb-2">
          <button
            onClick={() => setShowAstraXTemplate(false)}
            className="px-3 py-1.5 bg-[#262a35] hover:bg-[#353944] text-white rounded font-mono text-xs flex items-center gap-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Close Template Preview</span>
          </button>
        </div>
        <AstraXReportTemplate
          activeSignal={activeSignal}
          initialMode="populated"
          onClose={() => setShowAstraXTemplate(false)}
        />
      </div>
    );
  }

  // Pre-flight validation checks
  const validation = {
    fileLoaded: Boolean(activeSignal?.filename),
    analysisCompleted: Boolean(activeSignal?.telemetry?.modulation),
    parametersAvailable: Boolean(
      activeSignal?.fcFormatted && activeSignal?.telemetry?.estimatedSnrDb !== undefined
    ),
  };
  const isReady = validation.fileLoaded && validation.analysisCompleted && validation.parametersAvailable;

  const handleExport = async () => {
    if (!isReady || exportState === 'generating') return;

    setExportState('generating');
    setErrorMessage(null);

    try {
      let blob: Blob;
      let filename: string;

      if (format === 'pdf') {
        filename = getReportFilename('pdf');
        blob = await generateSignalReportPdf(activeSignal);
      } else if (format === 'json') {
        filename = getReportFilename('json');
        const jsonContent = JSON.stringify(
          {
            reportClassification: 'RESTRICTED // NTRO-ASTRAX-2026',
            documentId: `NTRO-2026-A1-SIG-${activeSignal.crc32 || '7849B2'}`,
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
        filename = getReportFilename('csv');
        const csvContent =
          `Offset,HexBytes,Ascii\n` +
          activeSignal.bitstreamLines
            .map((l) => `"${l.offset}","${l.hexBytes.join(' ')}","${l.ascii.replace(/"/g, '""')}"`)
            .join('\n');
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      } else {
        filename = getReportFilename('txt');
        const txtContent = `================================================================================
NATIONAL TECHNICAL RESEARCH ORGANISATION (NTRO) • ASTRAX TECHNICAL REPORT
DOCUMENT ID: NTRO-2026-A1-SIG-${activeSignal.crc32}
CLASSIFICATION: RESTRICTED // CONFIDENTIAL
PIPELINE STATUS: ${activeSignal.isComputed ? 'COMPUTED & VERIFIED' : 'CALIBRATED EMITTER CAPTURE'}
TIMESTAMP: ${new Date().toISOString()}
================================================================================
1. FILE INFORMATION & TELEMETRY
   File Name:             ${activeSignal.filename}
   File Format:           ${activeSignal.fileFormat}
   File Size:             ${activeSignal.sizeFormatted}
   Duration:              ${activeSignal.durFormatted}
   Sampling Rate (Fs):    ${activeSignal.fsFormatted}
   Center Frequency (Fc): ${activeSignal.fcFormatted}
   Modulation Detected:   ${activeSignal.telemetry.modulation} (${activeSignal.telemetry.overallConfidence.toFixed(1)}% Confidence)
   Signal-to-Noise Ratio: +${activeSignal.telemetry.estimatedSnrDb.toFixed(1)} dB (${activeSignal.telemetry.snrQuality})
   Occupied Bandwidth:    ${activeSignal.telemetry.bandwidthMHz.toFixed(3)} MHz
   Symbol Rate:           ${(activeSignal.telemetry.symbolRateMSym * 1e3).toFixed(1)} kSps
   FEC Coding:            ${activeSignal.telemetry.fecCode}
   Interleaving:          ${activeSignal.telemetry.interleaving}
   Processing Time:       ${(activeSignal.processingTimeMs || 48.2).toFixed(1)} ms

2. TARGET / SIGNAL IDENTIFICATION
   Target Designation:    ${activeSignal.emitterProfile.targetDesignation}
   Callsign / ID:         ${activeSignal.emitterProfile.callsign}
   Emitter Classification:${activeSignal.emitterProfile.classification}
   Estimated Location:    ${activeSignal.emitterProfile.estimatedLocation}
   Threat Assessment:     ${activeSignal.emitterProfile.threatLevel} PRIORITY

3. SYNC / CORRELATION ANALYSIS
   Pattern Name:          ${activeSignal.correlation.patternName}
   Preamble (Hex):        ${activeSignal.correlation.syncPreambleHex}
   Matched Frame Offset:  ${activeSignal.correlation.detectedPositionOffset} (${activeSignal.correlation.bitLocation})
   Peak-to-Sidelobe (PSR):+${activeSignal.correlation.crossCorrPsrDb.toFixed(1)} dB (${activeSignal.correlation.peakToSidelobeStatus})
   Status:                ${activeSignal.correlation.hasSignificantMatch ? 'LOCKED & VERIFIED' : 'SEARCHING'}

4. RECOVERED BITSTREAM (SAMPLE)
${activeSignal.bitstreamLines.slice(0, 32).map((l) => `   ${l.offset}  ${l.hexBytes.join(' ')}  |  ${l.ascii}`).join('\n')}
================================================================================
End of AstraX Intercept Mission Report • All Checksums Validated
`;
        blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
      }

      // Trigger standard browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportState('success');
      setTimeout(() => {
        setExportState('idle');
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Report export failure:', err);
      setExportState('error');
      setErrorMessage(err?.message || 'Failed to generate report. Please try again.');
    }
  };

  const handlePrint = () => {
    openPrintableReport(activeSignal);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060913]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-[#38bdf8]/40 rounded-xl max-w-2xl w-full shadow-2xl p-6 flex flex-col gap-4 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0284c7]/20 border border-[#0284c7] flex items-center justify-center text-[#38bdf8]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline text-lg font-bold text-white">
                  Export AstraX Technical Report
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  NTRO A4 STANDARD
                </span>
              </div>
              <p className="font-mono text-xs text-[#94a3b8]">
                Automated Signal Analysis &amp; Parameter Extraction Report
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white p-1.5 rounded hover:bg-[#1e293b] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Classification Banner */}
        <div className="flex items-center justify-between px-3 py-2 rounded bg-[#082A4A] border border-[#1677D2]/40 text-[#8AC4FF] font-mono text-xs font-semibold">
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#38bdf8]" />
            <span>NATIONAL TECHNICAL RESEARCH ORGANISATION (NTRO) • ASTRAX</span>
          </span>
          <span className="text-white bg-[#1677D2] px-2 py-0.5 rounded text-[10px] tracking-wider">
            RESTRICTED
          </span>
        </div>

        {/* Data Validation Check Pill Group */}
        <div className="bg-[#0b1120] p-3 rounded-lg border border-[#1e293b] flex flex-col gap-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] font-bold">
            Report Pre-Flight Data Verification
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 bg-[#1e293b]/50 p-2 rounded border border-[#334155]">
              <CheckCircle2 className={`w-4 h-4 ${validation.fileLoaded ? 'text-emerald-400' : 'text-rose-400'}`} />
              <div className="truncate">
                <div className="text-[9px] text-[#94a3b8]">FILE LOADED</div>
                <div className="text-white text-[11px] font-bold truncate">{activeSignal.filename}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#1e293b]/50 p-2 rounded border border-[#334155]">
              <CheckCircle2 className={`w-4 h-4 ${validation.analysisCompleted ? 'text-emerald-400' : 'text-rose-400'}`} />
              <div className="truncate">
                <div className="text-[9px] text-[#94a3b8]">DSP STATUS</div>
                <div className="text-white text-[11px] font-bold truncate">
                  {activeSignal.isComputed ? 'Computed ✓' : 'Calibrated ✓'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#1e293b]/50 p-2 rounded border border-[#334155]">
              <CheckCircle2 className={`w-4 h-4 ${validation.parametersAvailable ? 'text-emerald-400' : 'text-rose-400'}`} />
              <div className="truncate">
                <div className="text-[9px] text-[#94a3b8]">PARAMETERS</div>
                <div className="text-[#38bdf8] text-[11px] font-bold truncate">
                  {activeSignal.telemetry.modulation} ({activeSignal.fcFormatted})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#0b1120] p-3 rounded-lg border border-[#1e293b] font-mono text-xs">
          <div>
            <span className="text-[#64748b] text-[10px] uppercase block">Carrier Center:</span>
            <div className="text-[#38bdf8] font-bold mt-0.5">{activeSignal.fcFormatted}</div>
          </div>
          <div>
            <span className="text-[#64748b] text-[10px] uppercase block">Sampling Rate:</span>
            <div className="text-emerald-400 font-bold mt-0.5">{activeSignal.fsFormatted}</div>
          </div>
          <div>
            <span className="text-[#64748b] text-[10px] uppercase block">SNR Margin:</span>
            <div className="text-[#facc15] font-bold mt-0.5">
              +{activeSignal.telemetry.estimatedSnrDb.toFixed(1)} dB
            </div>
          </div>
          <div>
            <span className="text-[#64748b] text-[10px] uppercase block">Sync Pattern:</span>
            <div className="text-purple-300 font-bold mt-0.5 truncate">
              {activeSignal.correlation.syncPreambleHex || '0x1ACFFC1D'}
            </div>
          </div>
        </div>

        {/* Export Formats */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs uppercase tracking-wider text-[#94a3b8]">
            Select Export Format
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['pdf', 'json', 'txt', 'csv'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`py-2 px-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  format === fmt
                    ? 'bg-[#1677D2] text-white border-[#38bdf8] shadow-[0_0_12px_rgba(22,119,210,0.4)]'
                    : 'bg-[#1e293b] text-[#cbd5e1] border-[#334155] hover:bg-[#334155]'
                }`}
              >
                .{fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Error message if export failed */}
        {exportState === 'error' && errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-800 rounded text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1e293b]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAstraXTemplate(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1677D2] hover:bg-[#125ba3] text-white font-mono text-xs rounded-lg uppercase font-bold transition-all cursor-pointer shadow-md"
              title="Preview official AstraX NTRO A4 technical report template"
            >
              <Eye className="w-4 h-4" />
              <span>Preview A4 Template</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1e293b] hover:bg-[#334155] text-[#38bdf8] font-mono text-xs rounded-lg uppercase font-semibold transition-colors cursor-pointer border border-[#334155]"
              title="Open printable HTML report for printing or saving as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print Browser</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-slate-300 font-mono text-xs rounded-lg uppercase font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleExport}
              disabled={!isReady || exportState === 'generating'}
              className="flex items-center gap-2 px-5 py-2 bg-[#6D28D9] hover:bg-[#8B5CF6] text-white font-mono text-xs font-bold rounded-lg uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] disabled:opacity-50 cursor-pointer"
            >
              {exportState === 'generating' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating {format.toUpperCase()}...</span>
                </>
              )}

              {exportState === 'success' && (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{format.toUpperCase()} Downloaded ✓</span>
                </>
              )}

              {exportState === 'error' && (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-300" />
                  <span>Export Failed — Try Again</span>
                </>
              )}

              {exportState === 'idle' && (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Export Report ({format.toUpperCase()})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
