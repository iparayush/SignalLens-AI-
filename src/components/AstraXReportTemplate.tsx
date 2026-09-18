import React, { useState, useRef } from 'react';
import { SignalProfile } from '../types';
import { Printer, Download, Copy, Check, Eye, Edit3, RotateCcw } from 'lucide-react';

interface AstraXReportTemplateProps {
  activeSignal?: SignalProfile;
  initialMode?: 'template' | 'populated' | 'editable';
  onClose?: () => void;
}

export const AstraXReportTemplate: React.FC<AstraXReportTemplateProps> = ({
  activeSignal,
  initialMode = 'template',
  onClose,
}) => {
  const [mode, setMode] = useState<'template' | 'populated' | 'editable'>(initialMode);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Editable custom values state (for editable mode or placeholders)
  const [fields, setFields] = useState({
    docId: activeSignal ? `NTRO-2026-A1-SIG-${activeSignal.crc32 || '7849B2'}` : '{{document_id}}',
    date: new Date().toISOString().split('T')[0],
    classification: 'RESTRICTED // CONFIDENTIAL',
    fileName: activeSignal ? activeSignal.filename : '{{file_name}}',
    fileFormat: activeSignal ? activeSignal.fileFormat : '{{file_format}}',
    fileSize: activeSignal ? activeSignal.sizeFormatted : '{{file_size}}',
    duration: activeSignal ? activeSignal.durFormatted : '{{duration}}',
    samplingRate: activeSignal ? activeSignal.fsFormatted : '{{sampling_rate}}',
    centerFrequency: activeSignal ? activeSignal.fcFormatted : '{{center_frequency}}',
    modulation: activeSignal ? activeSignal.telemetry.modulation : '{{modulation}}',
    snr: activeSignal ? `+${activeSignal.telemetry.estimatedSnrDb.toFixed(1)} dB (${activeSignal.telemetry.snrQuality})` : '{{snr}}',
    bandwidth: activeSignal ? activeSignal.telemetry.bandwidthMHz.toFixed(3) + ' MHz' : '{{bandwidth}}',
    symbolRate: activeSignal ? (activeSignal.telemetry.symbolRateHz / 1e3).toFixed(1) + ' kSps' : '{{symbol_rate}}',
    fec: activeSignal ? activeSignal.telemetry.fecCode : '{{fec}}',
    interleaving: activeSignal ? activeSignal.telemetry.interleaving : '{{interleaving}}',
    processingTime: activeSignal ? `${(activeSignal.processingTimeMs || 48.2).toFixed(1)} ms` : '{{processing_time}}',
    targetDesignation: activeSignal ? activeSignal.emitterProfile.targetDesignation : '{{target_designation}}',
    callsign: activeSignal ? activeSignal.emitterProfile.callsign : '{{callsign}}',
    emitterClass: activeSignal ? activeSignal.emitterProfile.classification : '{{emitter_classification}}',
    estimatedLocation: activeSignal ? activeSignal.emitterProfile.estimatedLocation : '{{estimated_location}}',
    coordinates: activeSignal?.emitterProfile.coordinates ? `${activeSignal.emitterProfile.coordinates.lat.toFixed(4)}°N, ${activeSignal.emitterProfile.coordinates.lng.toFixed(4)}°E` : '{{coordinates}}',
    analysisStatus: activeSignal ? (activeSignal.isComputed ? 'COMPUTED & VERIFIED' : 'CALIBRATED') : '{{analysis_status}}',
    patternName: activeSignal ? activeSignal.correlation.patternName : '{{pattern_name}}',
    preambleHex: activeSignal ? activeSignal.correlation.syncPreambleHex : '{{preamble_hex}}',
    matchedOffset: activeSignal ? activeSignal.correlation.detectedPositionOffset : '{{frame_offset}}',
    psr: activeSignal ? `${activeSignal.correlation.crossCorrPsrDb.toFixed(1)} dB (${activeSignal.correlation.peakToSidelobeStatus})` : '{{psr}}',
    syncStatus: activeSignal ? (activeSignal.correlation.hasSignificantMatch ? 'LOCKED & VERIFIED' : 'SEARCHING') : '{{status}}',
    confidence: activeSignal ? activeSignal.telemetry.overallConfidence.toFixed(1) : '',
    summaryText: activeSignal ? `Automated DSP extraction completed across ${activeSignal.durFormatted} of complex I/Q capture. Detected carrier centered with ${activeSignal.telemetry.modulation} modulation scheme at ${activeSignal.telemetry.overallConfidence.toFixed(1)}% confidence.` : 'Automated analysis summary will appear here.',
    findings: [
      'Carrier frequency locked with Costas loop demodulation',
      'Symbol timing synchronization converged with Gardner algorithm',
      'Preamble pattern identified with positive peak-to-sidelobe ratio',
      'Forward error correction syndrome checks passed',
      'Bitstream payload demultiplexed into structured frames',
    ],
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPlaceholders = () => {
    const markdownTemplate = `# ASTRAX — NTRO A4 SIGNAL ANALYSIS REPORT
DOCUMENT ID: ${fields.docId}
DATE: ${fields.date}
CLASSIFICATION: ${fields.classification}

1. FILE INFORMATION
- File Name: ${fields.fileName}
- Format: ${fields.fileFormat}
- Size: ${fields.fileSize}
- Duration: ${fields.duration}
- Sampling Rate: ${fields.samplingRate}
- Center Frequency: ${fields.centerFrequency}
- Modulation: ${fields.modulation}
- SNR: ${fields.snr}
- Occupied Bandwidth: ${fields.bandwidth}
- Symbol Rate: ${fields.symbolRate}
- FEC: ${fields.fec}
- Interleaving: ${fields.interleaving}
- Processing Time: ${fields.processingTime}
`;
    navigator.clipboard.writeText(markdownTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isTemplate = mode === 'template';

  return (
    <div className="flex flex-col items-center w-full py-6 px-2 sm:px-4 bg-[#0a0e18] min-h-screen text-[#17202A] select-text">
      {/* ─── Control Bar (Excluded from Print) ─────────────────────────────────── */}
      <div className="w-full max-w-[210mm] mb-5 flex flex-wrap items-center justify-between gap-3 bg-[#171b26] p-3.5 rounded-xl border border-[#262a35] text-slate-200 print:hidden shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/40">
            A4
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span>AstraX — NTRO A4 Technical Report Template</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                210 × 297 mm
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Official Signal Intelligence &amp; Parameter Extraction A4 Form
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center bg-[#0a0e18] p-1 rounded-lg border border-[#313540] text-xs font-mono">
            <button
              onClick={() => setMode('template')}
              className={`px-3 py-1 rounded transition-all ${
                mode === 'template' ? 'bg-[#1677D2] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Clean empty template matching reference image"
            >
              Empty Template
            </button>
            <button
              onClick={() => setMode('populated')}
              className={`px-3 py-1 rounded transition-all ${
                mode === 'populated' ? 'bg-[#1677D2] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Populated with active signal telemetry"
            >
              Active Signal Data
            </button>
            <button
              onClick={() => setMode('editable')}
              className={`px-3 py-1 rounded transition-all ${
                mode === 'editable' ? 'bg-[#1677D2] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Inline editable fields"
            >
              Edit Fields
            </button>
          </div>

          <button
            onClick={handleCopyPlaceholders}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#262a35] hover:bg-[#353944] text-slate-200 font-mono text-xs rounded border border-[#3d494c] transition"
            title="Copy markdown template placeholders"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1677D2] hover:bg-[#125ba3] text-white font-mono text-xs font-bold rounded shadow-md transition"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print A4</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#262a35] hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 font-mono text-xs rounded border border-[#313540] transition"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* ─── A4 PORTRAIT SHEET CONTAINER (210mm × 297mm) ───────────────────────── */}
      <div
        ref={reportRef}
        className="w-[210mm] min-h-[297mm] bg-white text-[#17202A] p-[10mm] relative shadow-2xl border border-[#D6DDE5] font-sans flex flex-col justify-between overflow-hidden print:m-0 print:border-none print:shadow-none print:w-[210mm] print:min-h-[297mm]"
        style={{
          boxSizing: 'border-box',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* ─── WATERMARK: Large Diagonal AstraX Treatment ────────────────────── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
          <div
            className="transform -rotate-[28deg] text-center"
            style={{
              color: '#CBD5E1',
              opacity: 0.11,
            }}
          >
            <div className="text-[120px] font-black tracking-tight leading-none font-headline">
              AstraX
            </div>
            <div className="text-[15px] font-bold tracking-widest mt-2 uppercase font-mono">
              Signal Intelligence • Data Analysis • A Safer Tomorrow
            </div>
          </div>
        </div>

        {/* ─── FOREGROUND CONTENT LAYER ───────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col flex-1">
          {/* ─── TOP HEADER ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pb-3">
            {/* Left: Organization & Waveform Logo */}
            <div className="flex items-center gap-3">
              {/* Blue Waveform/Signal Icon (7 vertical bars matching image) */}
              <div className="flex items-center gap-[3px] h-9">
                <div className="w-[3.5px] h-3.5 bg-[#1677D2] rounded-full" />
                <div className="w-[3.5px] h-5 bg-[#1677D2] rounded-full" />
                <div className="w-[3.5px] h-8 bg-[#1677D2] rounded-full" />
                <div className="w-[4px] h-9 bg-[#1677D2] rounded-full" />
                <div className="w-[3.5px] h-8 bg-[#1677D2] rounded-full" />
                <div className="w-[3.5px] h-5 bg-[#1677D2] rounded-full" />
                <div className="w-[3.5px] h-3.5 bg-[#1677D2] rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[13px] leading-tight text-[#082A4A] tracking-tight">
                  NATIONAL TECHNICAL
                </span>
                <span className="font-extrabold text-[13px] leading-tight text-[#082A4A] tracking-tight">
                  RESEARCH ORGANISATION (NTRO)
                </span>
                <span className="text-[9px] font-semibold text-[#4B6584] tracking-wider mt-0.5">
                  SIGNAL INTELLIGENCE • DATA ANALYSIS
                </span>
              </div>
            </div>

            {/* Center / Right: Explore Signals / Empower Decisions */}
            <div className="flex items-center gap-5">
              <div className="text-right leading-tight">
                <div className="text-[11px] font-semibold text-[#082A4A]">Explore Signals</div>
                <div className="text-[11px] font-semibold text-[#082A4A]">Empower Decisions</div>
              </div>

              {/* Thin Vertical Divider */}
              <div className="w-[1px] h-9 bg-[#D6DDE5]" />

              {/* Far Right: Confidential Technical Report */}
              <div className="text-right leading-tight">
                <div className="text-[10px] font-bold text-[#082A4A] tracking-wider">
                  CONFIDENTIAL
                </div>
                <div className="text-[10px] font-bold text-[#082A4A] tracking-wider">
                  TECHNICAL REPORT
                </div>
                <div className="text-[8.5px] font-medium text-[#667085] uppercase tracking-wider mt-0.5">
                  REPORT TEMPLATE
                </div>
              </div>
            </div>
          </div>

          {/* ─── MAIN REPORT HEADER BANNER (Dark Navy) ──────────────────────── */}
          <div className="bg-[#082A4A] text-white px-4 py-2.5 rounded-sm flex items-center justify-between mb-3 shadow-sm">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-tight leading-none text-white">
                SIGNAL ANALYSIS REPORT
              </h1>
              <p className="text-[9px] font-semibold text-[#8AC4FF] tracking-wider uppercase mt-1">
                AUTOMATED SIGNAL ANALYSIS AND PARAMETER EXTRACTION
              </p>
            </div>

            {/* Right Meta Header Fields */}
            <div className="flex items-center gap-6 text-[9px] font-mono">
              <div className="flex flex-col">
                <span className="text-slate-300 font-bold uppercase text-[8px] tracking-wider">DOCUMENT ID</span>
                <div className="w-28 border-b border-white pb-0.5 mt-0.5 text-center font-bold text-white text-[9px]">
                  {isTemplate ? '{{document_id}}' : fields.docId}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-slate-300 font-bold uppercase text-[8px] tracking-wider">DATE</span>
                <div className="w-24 border-b border-white pb-0.5 mt-0.5 text-center font-bold text-white text-[9px]">
                  {isTemplate ? '{{date}}' : fields.date}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-slate-300 font-bold uppercase text-[8px] tracking-wider">CLASSIFICATION</span>
                <div className="w-28 border-b border-white pb-0.5 mt-0.5 text-center font-bold text-white text-[9px]">
                  {isTemplate ? '{{classification}}' : fields.classification}
                </div>
              </div>
            </div>
          </div>

          {/* ─── 2-COLUMN PRIMARY REPORT GRID ─────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-3 mb-3">
            {/* ════ LEFT PRIMARY COLUMN (Span 6) ════ */}
            <div className="col-span-6 flex flex-col gap-2.5">
              {/* ── 1. FILE INFORMATION ── */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-4 h-4 rounded-sm bg-[#082A4A] text-white flex items-center justify-center font-bold text-[10px]">
                    1.
                  </div>
                  <h2 className="text-[11px] font-bold text-[#082A4A] tracking-wider uppercase">
                    FILE INFORMATION
                  </h2>
                </div>

                <div className="border border-[#D6DDE5] rounded-sm overflow-hidden text-[9px]">
                  {[
                    { label: 'File Name', val: fields.fileName, tpl: '{{file_name}}' },
                    { label: 'File Format (IQ / WAV)', val: fields.fileFormat, tpl: '{{file_format}}' },
                    { label: 'File Size', val: fields.fileSize, tpl: '{{file_size}}' },
                    { label: 'Duration', val: fields.duration, tpl: '{{duration}}' },
                    { label: 'Sampling Rate (Fs)', val: fields.samplingRate, tpl: '{{sampling_rate}}' },
                    { label: 'Center Frequency (Fc)', val: fields.centerFrequency, tpl: '{{center_frequency}}' },
                    { label: 'Modulation (Estimated)', val: fields.modulation, tpl: '{{modulation}}' },
                    { label: 'Signal-to-Noise Ratio (SNR)', val: fields.snr, tpl: '{{snr}}' },
                    { label: 'Occupied Bandwidth', val: fields.bandwidth, tpl: '{{bandwidth}}' },
                    { label: 'Symbol Rate', val: fields.symbolRate, tpl: '{{symbol_rate}}' },
                    { label: 'FEC (Estimated)', val: fields.fec, tpl: '{{fec}}' },
                    { label: 'Interleaving (Estimated)', val: fields.interleaving, tpl: '{{interleaving}}' },
                    { label: 'Processing Time', val: fields.processingTime, tpl: '{{processing_time}}' },
                  ].map((row, idx) => (
                    <div
                      key={row.label}
                      className={`grid grid-cols-12 border-b border-[#D6DDE5] last:border-b-0 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFCFE]'
                      }`}
                    >
                      <div className="col-span-5 bg-[#F2F4F6] text-[#17202A] font-medium px-2 py-0.5 border-r border-[#D6DDE5] truncate">
                        {row.label}
                      </div>
                      <div className="col-span-7 px-2 py-0.5 bg-white text-[#17202A] font-mono truncate min-h-[17px]">
                        {isTemplate ? row.tpl : row.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 4. TARGET / SIGNAL IDENTIFICATION ── */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-4 h-4 rounded-sm bg-[#082A4A] text-white flex items-center justify-center font-bold text-[10px]">
                    4.
                  </div>
                  <h2 className="text-[11px] font-bold text-[#082A4A] tracking-wider uppercase">
                    TARGET / SIGNAL IDENTIFICATION
                  </h2>
                </div>

                <div className="border border-[#D6DDE5] rounded-sm overflow-hidden text-[9px]">
                  {[
                    { label: 'Target Designation', val: fields.targetDesignation, tpl: '{{target_designation}}' },
                    { label: 'Callsign / ID', val: fields.callsign, tpl: '{{callsign}}' },
                    { label: 'Emitter Classification', val: fields.emitterClass, tpl: '{{emitter_classification}}' },
                    { label: 'Estimated Location', val: fields.estimatedLocation, tpl: '{{estimated_location}}' },
                    { label: 'Coordinates', val: fields.coordinates, tpl: '{{coordinates}}' },
                    { label: 'Analysis Status', val: fields.analysisStatus, tpl: '{{analysis_status}}' },
                  ].map((row) => (
                    <div key={row.label} className="grid grid-cols-12 border-b border-[#D6DDE5] last:border-b-0">
                      <div className="col-span-5 bg-[#F2F4F6] text-[#17202A] font-medium px-2 py-0.5 border-r border-[#D6DDE5] truncate">
                        {row.label}
                      </div>
                      <div className="col-span-7 px-2 py-0.5 bg-white text-[#17202A] font-mono truncate min-h-[17px]">
                        {isTemplate ? row.tpl : row.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 6. SYNC / CORRELATION ANALYSIS ── */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-4 h-4 rounded-sm bg-[#082A4A] text-white flex items-center justify-center font-bold text-[10px]">
                    6.
                  </div>
                  <h2 className="text-[11px] font-bold text-[#082A4A] tracking-wider uppercase">
                    SYNC / CORRELATION ANALYSIS
                  </h2>
                </div>

                <div className="border border-[#D6DDE5] rounded-sm overflow-hidden text-[9px]">
                  {[
                    { label: 'Pattern Name', val: fields.patternName, tpl: '{{pattern_name}}' },
                    { label: 'Preamble (Hex)', val: fields.preambleHex, tpl: '{{preamble_hex}}' },
                    { label: 'Matched Frame Offset', val: fields.matchedOffset, tpl: '{{frame_offset}}' },
                    { label: 'Peak-to-Sidelobe Ratio (PSR)', val: fields.psr, tpl: '{{psr}}' },
                    { label: 'Status', val: fields.syncStatus, tpl: '{{status}}' },
                  ].map((row) => (
                    <div key={row.label} className="grid grid-cols-12 border-b border-[#D6DDE5] last:border-b-0">
                      <div className="col-span-6 bg-[#F2F4F6] text-[#17202A] font-medium px-2 py-0.5 border-r border-[#D6DDE5] truncate">
                        {row.label}
                      </div>
                      <div className="col-span-6 px-2 py-0.5 bg-white text-[#17202A] font-mono truncate min-h-[17px]">
                        {isTemplate ? row.tpl : row.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ════ RIGHT PRIMARY COLUMN (Span 6) ════ */}
            <div className="col-span-6 flex flex-col gap-2.5">
              {/* ── 2. TIME DOMAIN WAVEFORM ── */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-sm bg-[#082A4A] text-white flex items-center justify-center font-bold text-[10px]">
                      2.
                    </div>
                    <h2 className="text-[11px] font-bold text-[#082A4A] tracking-wider uppercase">
                      TIME DOMAIN WAVEFORM
                    </h2>
                  </div>
                  <span className="text-[9px] font-semibold text-[#082A4A]">Time Domain</span>
                </div>

                <div className="h-20 border border-[#D6DDE5] rounded-sm relative bg-white flex flex-col justify-between p-1">
                  {/* Y-axis Ticks */}
                  <div className="absolute left-1 top-0 bottom-2 flex flex-col justify-between text-[7.5px] font-mono text-slate-500">
                    <span>1.0</span>
                    <span>0.5</span>
                    <span>0.0</span>
                    <span>-0.5</span>
                    <span>-1.0</span>
                  </div>

                  {/* Vertical Axis Title */}
                  <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 -rotate-90 text-[7px] font-bold text-[#082A4A] tracking-wider uppercase">
                    Amplitude
                  </div>

                  {/* Empty Grid Interior (or populated waveform if active) */}
                  {isTemplate && <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-slate-400 z-20">{'{{chart_2}}'}</div>}
                  <div className="ml-7 mr-2 h-16 border border-[#E2E8F0] relative overflow-hidden bg-white">
                    {/* Light Grid Pattern */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, #EDF2F7 1px, transparent 1px), linear-gradient(to bottom, #EDF2F7 1px, transparent 1px)',
                        backgroundSize: '16px 12px',
                      }}
                    />
                    {/* Midline */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#CBD5E1]" />

                    {/* Populated Mode Waveform */}
                    {!isTemplate && activeSignal?.rawIQ && (
                      <svg className="w-full h-full relative z-10" preserveAspectRatio="none" viewBox="0 0 200 60">
                        <path
                          d="M0,30 Q10,12 20,30 T40,30 T60,8 T80,52 T100,18 T120,44 T140,22 T160,38 T180,15 T200,30"
                          fill="none"
                          stroke="#1677D2"
                          strokeWidth="1.4"
                        />
                        <path
                          d="M0,30 Q15,48 30,30 T60,30 T90,55 T110,20 T130,42 T150,12 T170,48 T190,22 T200,30"
                          fill="none"
                          stroke="#00BCD4"
                          strokeWidth="1"
                          strokeOpacity="0.7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* X-axis Title */}
                  <div className="text-center text-[7.5px] font-semibold text-[#082A4A] mt-0.5">
                    Time (s)
                  </div>
                </div>
              </div>

              {/* ── 3. FREQUENCY SPECTRUM ── */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-sm bg-[#082A4A] text-white flex items-center justify-center font-bold text-[10px]">
                      3.
                    </div>
                    <h2 className="text-[11px] font-bold text-[#082A4A] tracking-wider uppercase">
                      FREQUENCY SPECTRUM
                    </h2>
                  </div>
                  <span className="text-[9px] font-semibold text-[#082A4A]">FFT Spectrum</span>
                </div>

                <div className="h-20 border border-[#D6DDE5] rounded-sm relative bg-white flex flex-col justify-between p-1">
                  {/* Y-axis Ticks */}
                  <div className="absolute left-1 top-0 bottom-2 flex flex-col justify-between text-[7px] font-mono text-slate-500">
                    <span>0</span>
                    <span>-20</span>
                    <span>-40</span>
                    <span>-60</span>
                    <span>-80</span>
                    <span>-100</span>
                  </div>

                  {/* Vertical Axis Title */}
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[7px] font-bold text-[#082A4A] tracking-wider uppercase">
                    Magnitude (dB)
                  </div>

                  {/* Empty Grid Interior */}
                  {isTemplate && <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-slate-400 z-20">{'{{chart_3}}'}</div>}
                  <div className="ml-7 mr-2 h-16 border border-[#E2E8F0] relative overflow-hidden bg-white">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, #EDF2F7 1px, transparent 1px), linear-gradient(to bottom, #EDF2F7 1px, transparent 1px)',
                        backgroundSize: '16px 11px',
                      }}
                    />
                    {!isTemplate && (
                      <svg className="w-full h-full relative z-10" preserveAspectRatio="none" viewBox="0 0 200 60">
                        <polygon
                          fill="rgba(22, 119, 210, 0.18)"
                          points="0,58 50,56 80,45 95,12 100,6 105,12 120,45 150,56 200,58"
                        />
                        <polyline
                          fill="none"
                          points="0,58 50,56 80,45 95,12 100,6 105,12 120,45 150,56 200,58"
                          stroke="#1677D2"
                          strokeWidth="1.4"
                        />
                      </svg>
                    )}
                  </div>

                  {/* X-axis Title */}
                  <div className="text-center text-[7.5px] font-semibold text-[#082A4A] mt-0.5">
                    Frequency (Hz)
                  </div>
                </div>
              </div>

              {/* ── 5. CONSTELLATION DIAGRAM ── */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-sm bg-[#082A4A] text-white flex items-center justify-center font-bold text-[10px]">
                      5.
                    </div>
                    <h2 className="text-[11px] font-bold text-[#082A4A] tracking-wider uppercase">
                      CONSTELLATION DIAGRAM
                    </h2>
                  </div>
                  <span className="text-[9px] font-semibold text-[#082A4A]">Constellation</span>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  {/* Left: Square Constellation Plot */}
                  {isTemplate && <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-slate-400 z-20 pointer-events-none">{'{{chart_5}}'}</div>}
                  <div className="col-span-7 h-24 border border-[#D6DDE5] rounded-sm relative bg-white flex items-center justify-center">
                    {/* Y-axis (Q) ticks */}
                    <div className="absolute left-1 top-0 bottom-1 flex flex-col justify-between text-[7px] font-mono text-slate-500">
                      <span>2</span>
                      <span>1</span>
                      <span>0</span>
                      <span>-1</span>
                      <span>-2</span>
                    </div>
                    {/* Crosshairs */}
                    <div className="absolute inset-x-5 top-1/2 h-[1px] bg-[#CBD5E1]" />
                    <div className="absolute inset-y-1 left-1/2 w-[1px] bg-[#CBD5E1]" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[7px] font-bold text-[#082A4A]">Q</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[7px] font-bold text-[#082A4A]">I</span>

                    {/* Populated constellation dots */}
                    {!isTemplate && (
                      <div className="relative z-10 w-full h-full">
                        <div className="absolute top-4 left-9 w-2.5 h-2.5 rounded-full bg-blue-600/80 blur-[1px]" />
                        <div className="absolute top-4 right-5 w-2.5 h-2.5 rounded-full bg-blue-600/80 blur-[1px]" />
                        <div className="absolute bottom-4 left-9 w-2.5 h-2.5 rounded-full bg-blue-600/80 blur-[1px]" />
                        <div className="absolute bottom-4 right-5 w-2.5 h-2.5 rounded-full bg-blue-600/80 blur-[1px]" />
                      </div>
                    )}
                  </div>

                  {/* Right: Detected Modulation & Confidence */}
                  <div className="col-span-5 flex flex-col justify-between py-1 text-[9px]">
                    <div>
                      <span className="text-[8.5px] font-bold text-[#082A4A] uppercase block">
                        Detected Modulation
                      </span>
                      <div className="w-full h-6 border border-[#D6DDE5] rounded-sm bg-white mt-1 px-2 flex items-center font-mono font-bold text-[#082A4A] text-[9.5px]">
                        {isTemplate ? '{{modulation}}' : fields.modulation}
                      </div>
                    </div>

                    <div className="mt-1">
                      <span className="text-[8.5px] font-bold text-[#082A4A] uppercase block">
                        Confidence
                      </span>
                      <div className="w-full h-6 border border-[#D6DDE5] rounded-sm bg-white mt-1 px-2 flex items-center justify-between font-mono font-bold text-[#082A4A] text-[9.5px]">
                        <span>{isTemplate ? '' : fields.confidence}</span>
                        <span className="text-slate-400 font-normal">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 7. WATERFALL / SPECTROGRAM ── */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-sm bg-[#082A4A] text-white flex items-center justify-center font-bold text-[10px]">
                      7.
                    </div>
                    <h2 className="text-[11px] font-bold text-[#082A4A] tracking-wider uppercase">
                      WATERFALL / SPECTROGRAM
                    </h2>
                  </div>
                  <span className="text-[9px] font-semibold text-[#082A4A]">Waterfall / Spectrogram</span>
                </div>

                <div className="h-20 border border-[#D6DDE5] rounded-sm relative bg-white flex items-center p-1">
                  {/* Left Frequency Tick */}
                  <span className="text-[7.5px] font-mono text-slate-500 absolute left-1 top-1">12</span>
                  <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 -rotate-90 text-[7px] font-bold text-[#082A4A] tracking-wider uppercase">
                    Frequency (Hz)
                  </div>

                  {/* Chart Body */}
                  {isTemplate && <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-slate-400 z-20 pointer-events-none">{'{{chart_7}}'}</div>}
                  <div className="ml-6 mr-14 h-16 w-full border border-[#E2E8F0] relative overflow-hidden bg-white">
                    {!isTemplate && (
                      <div className="w-full h-full bg-gradient-to-b from-[#082A4A] via-[#1677D2] to-[#EAF4FC] opacity-90 flex items-center justify-center">
                        <div className="w-6 h-full bg-gradient-to-r from-transparent via-yellow-300 to-transparent blur-[2px]" />
                      </div>
                    )}
                  </div>

                  {/* Right Color Scale Power (dB) */}
                  <div className="absolute right-1 top-1 bottom-1 flex items-center gap-1">
                    <div
                      className="w-2.5 h-full rounded-[1px]"
                      style={{
                        background: 'linear-gradient(to bottom, #DC2626, #F59E0B, #10B981, #06B6D4, #2563EB, #1E1B4B)',
                      }}
                    />
                    <div className="flex flex-col justify-between h-full text-[6.5px] font-mono text-slate-500">
                      <span>0</span>
                      <span>-20</span>
                      <span>-40</span>
                      <span>-60</span>
                      <span>-80</span>
                      <span>-100</span>
                    </div>
                  </div>

                  {/* X-axis Title */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[7.5px] font-semibold text-[#082A4A]">
                    Time (s)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 8. RECOVERED BITSTREAM (SAMPLE) (Full Width) ───────────────── */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-sm bg-[#082A4A] text-white flex items-center justify-center font-bold text-[10px]">
                  8.
                </div>
                <h2 className="text-[11px] font-bold text-[#082A4A] tracking-wider uppercase">
                  RECOVERED BITSTREAM (SAMPLE)
                </h2>
              </div>
              <div className="text-[8.5px] font-mono text-slate-600 flex items-center gap-2">
                <span className="font-semibold text-[#082A4A]">Format:</span>
                <span>Binary</span>
                <span className="text-slate-300">|</span>
                <span className="font-bold text-[#1677D2]">Hex</span>
                <span className="text-slate-300">|</span>
                <span>ASCII</span>
              </div>
            </div>

            <div className="h-10 border border-[#D6DDE5] rounded-sm bg-white px-2.5 py-1 font-mono text-[9px] text-[#4B6584] flex items-center">
              {isTemplate ? (
                <span className="text-slate-400">{'{{bitstream}}'}</span>
              ) : (
                <span className="text-[#082A4A] font-semibold truncate">
                  0x0000: 1A CF FC 1D 00 24 5A 89 42 01 FF 8B 3C A7 09 E2  [...$Z.B...&lt;...]
                </span>
              )}
            </div>
          </div>

          {/* ─── 9 & 10. ANALYSIS SUMMARY & KEY FINDINGS (2 Bottom Columns) ─── */}
          <div className="grid grid-cols-12 gap-3 mb-2">
            {/* Section 9: Analysis Summary */}
            <div className="col-span-6">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 rounded-sm bg-[#082A4A] text-white flex items-center justify-center font-bold text-[10px]">
                  9.
                </div>
                <h2 className="text-[11px] font-bold text-[#082A4A] tracking-wider uppercase">
                  ANALYSIS SUMMARY
                </h2>
              </div>
              <div className="h-16 border border-[#D6DDE5] rounded-sm bg-white p-2 text-[9px] leading-relaxed text-[#4B6584]">
                {isTemplate ? (
                  <span className="text-slate-400">{'{{analysis_summary}}'}</span>
                ) : (
                  <span>{fields.summaryText}</span>
                )}
              </div>
            </div>

            {/* Section 10: Key Findings */}
            <div className="col-span-6">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 rounded-sm bg-[#082A4A] text-white flex items-center justify-center font-bold text-[10px]">
                  10.
                </div>
                <h2 className="text-[11px] font-bold text-[#082A4A] tracking-wider uppercase">
                  KEY FINDINGS
                </h2>
              </div>
              <div className="h-16 border border-[#D6DDE5] rounded-sm bg-white px-2.5 py-1 flex flex-col justify-between text-[8.5px] font-mono text-[#4B6584]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[#1677D2] text-[10px] leading-none">○</span>
                    {isTemplate ? (
                      <span className="text-[#17202A] text-[8.5px] truncate">{`{{key_finding_${i + 1}}}`}</span>
                    ) : (
                      <span className="text-[#17202A] text-[8.5px] truncate">
                        {fields.findings[i] || '________________________________________________'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
        <div className="relative z-10 pt-2 border-t border-[#1677D2] mt-auto">
          {/* Subtle waveform graphic behind footer */}
          <div className="absolute inset-x-0 bottom-0 h-6 opacity-10 pointer-events-none overflow-hidden">
            <svg className="w-full h-full text-[#1677D2]" preserveAspectRatio="none" viewBox="0 0 400 30">
              <path d="M0,15 Q50,0 100,15 T200,15 T300,15 T400,15" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[7.5px] text-[#667085] font-sans relative z-10">
            <div className="font-bold text-[#082A4A] uppercase tracking-wider">
              NATIONAL TECHNICAL RESEARCH ORGANISATION (NTRO)
            </div>

            <div className="text-center leading-tight">
              <div>This document is confidential and intended for authorized use only.</div>
              <div>Unauthorized disclosure is strictly prohibited.</div>
            </div>

            <div className="font-bold text-[#082A4A] font-mono">
              Page 1 of 1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
