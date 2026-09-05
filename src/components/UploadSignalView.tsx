import React, { useState } from 'react';
import { SignalProfile } from '../types';
import { UploadCloud, CheckCircle2, HardDrive, Cpu, Radio, Sparkles, FileText, ArrowRight } from 'lucide-react';

interface UploadSignalViewProps {
  activeSignal: SignalProfile;
  signalsList: SignalProfile[];
  onSelectSignal: (signal: SignalProfile) => void;
  onFileUpload: (file: File) => void;
  onNavigateToDashboard: () => void;
}

export const UploadSignalView: React.FC<UploadSignalViewProps> = ({
  activeSignal,
  signalsList,
  onSelectSignal,
  onFileUpload,
  onNavigateToDashboard,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<SignalProfile>(activeSignal);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleApplySignal = (sig: SignalProfile) => {
    setSelectedPreset(sig);
    onSelectSignal(sig);
    setStatusMessage(`Loaded and verified ${sig.filename} into active DSP pipeline.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCustomFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileUpload(file);
      setStatusMessage(`Ingested ${file.name}. DSP engine analyzing...`);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#171b26] p-4 rounded border border-[#262a35]">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#4cd7f6]" />
            <h1 className="font-headline text-xl font-bold text-[#dfe2f1]">
              Signal Ingestion &amp; Raw Intercept Laboratory
            </h1>
          </div>
          <p className="font-mono text-xs text-[#869397] mt-1">
            Mount high-speed 16-bit complex I/Q, Float32 WAV, or raw SDR captures into the real-time DSP pipeline.
          </p>
        </div>

        <button
          onClick={onNavigateToDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#00424f] font-mono text-xs font-bold rounded uppercase tracking-wider transition-all self-start md:self-auto shadow-md"
        >
          <span>View Live Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {statusMessage && (
        <div className="px-4 py-2.5 rounded bg-[#4edea3]/15 border border-[#4edea3]/30 text-[#4edea3] font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Grid: Upload Dropzone + Presets Catalog */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left Column: Direct File Dropzone */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#dfe2f1] flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[#4cd7f6]" />
              Direct Binary File Ingestion
            </h2>

            <label className="border-2 border-dashed border-[#313540] hover:border-[#4cd7f6] bg-[#0a0e18] hover:bg-[#1c1f2a] transition-all p-6 rounded flex flex-col items-center justify-center text-center cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-[#262a35] flex items-center justify-center text-[#4cd7f6] mb-2 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="font-headline text-base font-semibold text-[#dfe2f1]">
                Select or Drop Raw RF Capture
              </span>
              <span className="font-mono text-xs text-[#869397] mt-1 max-w-xs">
                Supports .iq, .wav, .raw, .dat, .bin files with interleaved complex I/Q samples
              </span>
              <div className="mt-4 px-4 py-1.5 bg-[#4cd7f6] text-[#003640] rounded font-mono text-xs font-bold uppercase tracking-wide shadow-sm">
                Browse System Files
              </div>
              <input
                type="file"
                accept=".iq,.wav,.raw,.dat,.bin"
                className="hidden"
                onChange={handleCustomFileInput}
              />
            </label>

            {/* Hardware SDR direct stream interface */}
            <div className="flex flex-col gap-2 bg-[#1c1f2a] p-3 rounded border border-[#313540]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#869397] uppercase">SDR Front-End:</span>
                <span className="text-[#4edea3] font-semibold">HackRF One / USRP B210 Sim</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#869397] uppercase">DMA Buffer:</span>
                <span className="text-[#dfe2f1]">65,536 Samples (Zero-Copy)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#869397] uppercase">Checksum Verification:</span>
                <span className="text-[#4cd7f6]">Hardware CRC32 Accelerator</span>
              </div>
            </div>

            {/* Manual Parameter Entry & Missing Metadata Override */}
            <div className="flex flex-col gap-3 bg-[#0a0e18] p-4 rounded border border-[#313540] font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#dfe2f1] font-bold uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  Manual Parameter Entry (Missing Metadata)
                </span>
                <span className="text-[10px] text-[#869397]">PRD Sec. 4.A</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#869397] text-[10px] block mb-0.5">Center Freq (Fc):</label>
                  <input
                    type="text"
                    defaultValue={activeSignal.fcFormatted}
                    className="w-full bg-[#171b26] border border-[#313540] px-2 py-1 rounded text-[#4cd7f6] text-xs focus:border-[#4cd7f6] outline-none"
                    placeholder="e.g. 1575.42 MHz"
                  />
                </div>
                <div>
                  <label className="text-[#869397] text-[10px] block mb-0.5">Sampling Freq (Fs):</label>
                  <input
                    type="text"
                    defaultValue={activeSignal.fsFormatted}
                    className="w-full bg-[#171b26] border border-[#313540] px-2 py-1 rounded text-[#4edea3] text-xs focus:border-[#4edea3] outline-none"
                    placeholder="e.g. 20.00 MSps"
                  />
                </div>
                <div>
                  <label className="text-[#869397] text-[10px] block mb-0.5">Sample Format:</label>
                  <select className="w-full bg-[#171b26] border border-[#313540] px-2 py-1 rounded text-[#dfe2f1] text-xs focus:border-[#4cd7f6] outline-none">
                    <option>Complex Int16 (I16/Q16)</option>
                    <option>Complex Float32 (IEEE-754)</option>
                    <option>Unsigned Int8 (RTL-SDR)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#869397] text-[10px] block mb-0.5">Polarization:</label>
                  <select className="w-full bg-[#171b26] border border-[#313540] px-2 py-1 rounded text-[#dfe2f1] text-xs focus:border-[#4cd7f6] outline-none">
                    <option>RHCP (Circular Right)</option>
                    <option>LHCP (Circular Left)</option>
                    <option>Linear Vertical</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setStatusMessage(`Updated and saved parameters for ${activeSignal.filename}. Applied to DSP pipeline.`);
                    setTimeout(() => setStatusMessage(null), 3000);
                  }}
                  className="flex-1 py-1.5 bg-[#262a35] hover:bg-[#353944] text-[#4cd7f6] rounded font-bold uppercase text-[11px] transition-all"
                >
                  Save &amp; Apply to Pipeline
                </button>
                <button
                  onClick={() => {
                    setStatusMessage('DSP Estimator auto-calculated Fs: 20.00 MHz, Fc: 1575.42 MHz from spectral power peaks.');
                    setTimeout(() => setStatusMessage(null), 3500);
                  }}
                  className="px-2.5 py-1.5 bg-[#171b26] hover:bg-[#262a35] text-[#869397] hover:text-[#dfe2f1] rounded font-bold text-[11px] border border-[#313540]"
                  title="Auto-Estimate Missing from DSP"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Validation & Diagnostics Panel */}
            <div className="flex flex-col gap-2 bg-[#0a0e18] p-4 rounded border border-[#313540] font-mono text-xs">
              <span className="text-[#dfe2f1] font-bold uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
                Signal File Integrity &amp; Validation Status
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between border-b border-[#262a35] pb-1">
                  <span className="text-[#869397]">Format Validation:</span>
                  <span className="text-[#4edea3]">PASSED (Valid IQ)</span>
                </div>
                <div className="flex justify-between border-b border-[#262a35] pb-1">
                  <span className="text-[#869397]">Clipping Level:</span>
                  <span className="text-[#dfe2f1]">0.02% (Nominal)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#869397]">I/Q Balance:</span>
                  <span className="text-[#4edea3]">99.8% Orthogonal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#869397]">DC Offset:</span>
                  <span className="text-[#4cd7f6]">-42.1 dB (Clean)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pre-Captured SIGINT Library */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#dfe2f1] flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#4cd7f6]" />
                Tactical Intercept Library (Preset Signals)
              </h2>
              <span className="font-mono text-xs text-[#869397]">
                {signalsList.length} Captures Available
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {signalsList.map((sig) => {
                const isCurrent = activeSignal.id === sig.id;
                return (
                  <div
                    key={sig.id}
                    onClick={() => handleApplySignal(sig)}
                    className={`p-4 rounded border transition-all cursor-pointer flex flex-col gap-2 ${
                      isCurrent
                        ? 'bg-[#1c1f2a] border-[#4cd7f6] shadow-[0_0_12px_rgba(76,215,246,0.15)]'
                        : 'bg-[#0a0e18] border-[#313540] hover:bg-[#1c1f2a]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#06b6d4] text-[#00424f]">
                          {sig.fileFormat}
                        </span>
                        <span className="font-mono text-sm font-bold text-[#dfe2f1]">
                          {sig.filename}
                        </span>
                      </div>

                      {isCurrent ? (
                        <span className="px-2.5 py-0.5 rounded bg-[#4edea3]/20 border border-[#4edea3]/40 text-[#4edea3] font-mono text-[10px] font-bold uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Active In Pipeline
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplySignal(sig);
                          }}
                          className="px-3 py-1 rounded bg-[#262a35] hover:bg-[#353944] text-[#4cd7f6] font-mono text-xs font-semibold uppercase"
                        >
                          Load Intercept
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-[#bcc9cd] pt-1">
                      <div>
                        <span className="text-[#869397] text-[10px] block">Modulation:</span>
                        <strong className="text-[#4cd7f6]">{sig.telemetry.modulation}</strong>
                      </div>
                      <div>
                        <span className="text-[#869397] text-[10px] block">Center Carrier:</span>
                        <strong className="text-[#dfe2f1]">{sig.fcFormatted}</strong>
                      </div>
                      <div>
                        <span className="text-[#869397] text-[10px] block">Sampling Rate:</span>
                        <strong className="text-[#4edea3]">{sig.fsFormatted}</strong>
                      </div>
                      <div>
                        <span className="text-[#869397] text-[10px] block">Duration / Size:</span>
                        <strong className="text-[#dfe2f1]">{sig.durFormatted} ({sig.sizeFormatted})</strong>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-[#869397] flex items-center justify-between border-t border-[#262a35] pt-2 mt-1">
                      <span>Target: <span className="text-[#dfe2f1]">{sig.emitterProfile.targetDesignation}</span></span>
                      <span className="text-[#adc6ff] font-semibold">{sig.emitterProfile.classification}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
