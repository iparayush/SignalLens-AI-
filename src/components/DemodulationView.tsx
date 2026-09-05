import React, { useState } from 'react';
import { SignalProfile, ModulationType, ModulationCategory } from '../types';
import { Radio, Activity, CheckCircle2, Sliders, Play, RotateCcw, Zap, Layers, RefreshCw } from 'lucide-react';

interface DemodulationViewProps {
  activeSignal: SignalProfile;
  onUpdateModulation?: (mod: ModulationType) => void;
}

export const DemodulationView: React.FC<DemodulationViewProps> = ({
  activeSignal,
  onUpdateModulation,
}) => {
  const [selectedFamily, setSelectedFamily] = useState<ModulationCategory>('PSK');
  const [selectedMod, setSelectedMod] = useState<ModulationType>(activeSignal.telemetry.modulation);
  const [rollOff, setRollOff] = useState<number>(0.35);
  const [loopBw, setLoopBw] = useState<number>(1.2);
  const [timingAlgo, setTimingAlgo] = useState<'Gardner' | 'Mueller-Muller' | 'Early-Late'>('Gardner');
  const [slicerMode, setSlicerMode] = useState<'hard' | 'soft'>('soft');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [demodSuccessNotice, setDemodSuccessNotice] = useState<string | null>(null);

  const MOD_FAMILIES: Record<ModulationCategory, ModulationType[]> = {
    PSK: ['BPSK', 'QPSK', '8PSK'],
    QAM: ['16-QAM', '64-QAM', '256-QAM'],
    FSK: ['2-FSK', '4-FSK', 'GMSK'],
  };

  const handleSelectMod = (mod: ModulationType) => {
    setSelectedMod(mod);
    if (onUpdateModulation) {
      onUpdateModulation(mod);
    }
  };

  const handleRunDemodulation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setDemodSuccessNotice(`Demodulated ${selectedMod} stream: 19,200 bits recovered at 0 frame slippage.`);
      setTimeout(() => setDemodSuccessNotice(null), 3500);
    }, 800);
  };

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#171b26] p-4 rounded border border-[#262a35]">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#4cd7f6]" />
            <h1 className="font-headline text-xl font-bold text-[#dfe2f1]">
              Signal Demodulation &amp; Carrier Recovery Engine
            </h1>
          </div>
          <p className="font-mono text-xs text-[#869397] mt-1">
            Reconfigurable FSK / PSK / QAM demodulator with Costas carrier recovery, symbol timing, and decision slicing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunDemodulation}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#00424f] font-mono text-xs font-bold rounded uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(6,182,212,0.35)] disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Demodulating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Demodulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {demodSuccessNotice && (
        <div className="px-4 py-2.5 rounded bg-[#4edea3]/15 border border-[#4edea3]/30 text-[#4edea3] font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{demodSuccessNotice}</span>
        </div>
      )}

      {/* Main Grid: Modulation Selection & Controls */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left Column: Modulation Family & Scheme Selection */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#dfe2f1] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#4cd7f6]" />
              1. Select / Verify Modulation Scheme
            </h2>

            {/* Modulation Family Tabs: PSK / QAM / FSK */}
            <div className="grid grid-cols-3 gap-2 bg-[#0a0e18] p-1 rounded border border-[#313540]">
              {(['PSK', 'QAM', 'FSK'] as ModulationCategory[]).map((fam) => (
                <button
                  key={fam}
                  onClick={() => {
                    setSelectedFamily(fam);
                    handleSelectMod(MOD_FAMILIES[fam][0]);
                  }}
                  className={`py-2 text-center rounded font-mono text-xs font-bold transition-all uppercase ${
                    selectedFamily === fam
                      ? 'bg-[#4cd7f6] text-[#003640] shadow-sm'
                      : 'text-[#bcc9cd] hover:text-[#dfe2f1]'
                  }`}
                >
                  {fam} Family
                </button>
              ))}
            </div>

            {/* Specific Schemes in Selected Family */}
            <div className="grid grid-cols-3 gap-2">
              {MOD_FAMILIES[selectedFamily].map((mod) => {
                const isSelected = selectedMod === mod;
                return (
                  <button
                    key={mod}
                    onClick={() => handleSelectMod(mod)}
                    className={`py-2.5 px-3 rounded font-mono text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-[#1c1f2a] border-[#4cd7f6] text-[#4cd7f6] shadow-[0_0_10px_rgba(76,215,246,0.2)]'
                        : 'bg-[#0a0e18] border-[#313540] text-[#bcc9cd] hover:border-[#869397]'
                    }`}
                  >
                    <span>{mod}</span>
                    {isSelected && (
                      <span className="text-[9px] text-[#4edea3] font-semibold uppercase">ACTIVE</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Demodulation Parameter Controls */}
            <div className="flex flex-col gap-3 pt-2 border-t border-[#262a35] font-mono text-xs">
              <span className="text-[#869397] uppercase tracking-wider text-[11px] font-semibold">
                Demodulation DSP Tuning Parameters
              </span>

              {/* RRC Roll-off factor */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-[#bcc9cd]">RRC Roll-off (α):</span>
                  <span className="text-[#4cd7f6] font-bold">{rollOff.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.5"
                  step="0.05"
                  value={rollOff}
                  onChange={(e) => setRollOff(parseFloat(e.target.value))}
                  className="accent-[#4cd7f6] cursor-pointer"
                />
              </div>

              {/* Carrier Loop Bandwidth */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-[#bcc9cd]">Costas Loop Bandwidth:</span>
                  <span className="text-[#4edea3] font-bold">{loopBw.toFixed(1)} kHz</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  value={loopBw}
                  onChange={(e) => setLoopBw(parseFloat(e.target.value))}
                  className="accent-[#4edea3] cursor-pointer"
                />
              </div>

              {/* Symbol Timing Recovery Algorithm */}
              <div className="flex flex-col gap-1">
                <label className="text-[#bcc9cd]">Symbol Timing Recovery:</label>
                <div className="grid grid-cols-3 gap-1.5 bg-[#0a0e18] p-1 rounded border border-[#313540]">
                  {(['Gardner', 'Mueller-Muller', 'Early-Late'] as const).map((algo) => (
                    <button
                      key={algo}
                      onClick={() => setTimingAlgo(algo)}
                      className={`py-1 text-[10px] rounded font-semibold ${
                        timingAlgo === algo
                          ? 'bg-[#262a35] text-[#4cd7f6] border border-[#4cd7f6]/40'
                          : 'text-[#869397] hover:text-[#dfe2f1]'
                      }`}
                    >
                      {algo.split('-')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slicer Mode */}
              <div className="flex flex-col gap-1">
                <label className="text-[#bcc9cd]">Decision Slicer:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSlicerMode('soft')}
                    className={`py-1.5 px-2 rounded border text-center font-bold ${
                      slicerMode === 'soft'
                        ? 'bg-[#1c1f2a] border-[#4edea3] text-[#4edea3]'
                        : 'bg-[#0a0e18] border-[#313540] text-[#869397]'
                    }`}
                  >
                    Soft LLR Slicer
                  </button>
                  <button
                    onClick={() => setSlicerMode('hard')}
                    className={`py-1.5 px-2 rounded border text-center font-bold ${
                      slicerMode === 'hard'
                        ? 'bg-[#1c1f2a] border-[#4edea3] text-[#4edea3]'
                        : 'bg-[#0a0e18] border-[#313540] text-[#869397]'
                    }`}
                  >
                    Hard Euclidean
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Constellation Scope & Demodulation Telemetry */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#dfe2f1] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#4cd7f6]" />
                2. Real-Time Demodulated Constellation &amp; Eye Diagram
              </h2>
              <span className="font-mono text-xs text-[#4edea3] font-bold">
                EVM: {activeSignal.evmRms}% RMS
              </span>
            </div>

            {/* Constellation Canvas View */}
            <div className="relative w-full h-64 bg-[#0a0e18] rounded border border-[#262a35] flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 240 240">
                {/* Quadrant Axis lines */}
                <line x1="120" y1="10" x2="120" y2="230" stroke="#313540" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="10" y1="120" x2="230" y2="120" stroke="#313540" strokeWidth="1" strokeDasharray="3 3" />

                {/* Unit amplitude circle */}
                <circle cx="120" cy="120" r="75" fill="none" stroke="#1c1f2a" strokeWidth="1" strokeDasharray="2 2" />

                {/* Dynamic Constellation Points depending on selectedMod */}
                {selectedMod === 'BPSK' && (
                  <g fill="#4cd7f6">
                    {/* 2 poles on I axis */}
                    <circle cx="45" cy="120" r="4" opacity="0.9" />
                    <circle cx="195" cy="120" r="4" opacity="0.9" />
                    {/* Clouds */}
                    <circle cx="47" cy="118" r="2.5" opacity="0.6" />
                    <circle cx="43" cy="123" r="2" opacity="0.6" />
                    <circle cx="193" cy="122" r="2.5" opacity="0.6" />
                    <circle cx="197" cy="117" r="2" opacity="0.6" />
                  </g>
                )}

                {(selectedMod === 'QPSK' || selectedMod === '4-FSK') && (
                  <g fill="#4cd7f6">
                    {/* 4 quadrants */}
                    {[
                      [65, 65],
                      [175, 65],
                      [65, 175],
                      [175, 175],
                    ].map(([cx, cy], i) => (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r="4.5" opacity="0.9" />
                        <circle cx={cx - 3} cy={cy + 2} r="2.2" opacity="0.6" />
                        <circle cx={cx + 3} cy={cy - 2} r="2.0" opacity="0.6" />
                        <circle cx={cx + 1} cy={cy + 3} r="1.8" opacity="0.5" />
                        <circle cx={cx - 2} cy={cy - 3} r="1.8" opacity="0.5" />
                      </g>
                    ))}
                  </g>
                )}

                {selectedMod === '8PSK' && (
                  <g fill="#4cd7f6">
                    {/* 8 circle points around perimeter */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                      const rad = (deg * Math.PI) / 180;
                      const cx = 120 + 75 * Math.cos(rad);
                      const cy = 120 + 75 * Math.sin(rad);
                      return <circle key={deg} cx={cx} cy={cy} r="3.5" opacity="0.9" />;
                    })}
                  </g>
                )}

                {(selectedMod === '16-QAM' || selectedMod === '64-QAM' || selectedMod === '256-QAM') && (
                  <g fill="#4cd7f6">
                    {/* 4x4 Grid for 16-QAM */}
                    {[45, 95, 145, 195].map((x) =>
                      [45, 95, 145, 195].map((y) => (
                        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" opacity="0.85" />
                      ))
                    )}
                  </g>
                )}

                {(selectedMod === '2-FSK' || selectedMod === 'GMSK') && (
                  <g>
                    {/* FSK Continuous Phase circle trajectory */}
                    <circle cx="120" cy="120" r="65" fill="none" stroke="#4cd7f6" strokeWidth="2" opacity="0.7" />
                    <circle cx="55" cy="120" r="5" fill="#4edea3" />
                    <circle cx="185" cy="120" r="5" fill="#4edea3" />
                  </g>
                )}
              </svg>

              <span className="absolute top-2 left-3 font-mono text-[10px] text-[#4cd7f6] bg-[#0a0e18]/80 px-2 py-0.5 rounded border border-[#313540]">
                SCHEME: {selectedMod}
              </span>
              <span className="absolute bottom-2 right-3 font-mono text-[10px] text-[#869397]">
                Normalized Decision Grids
              </span>
            </div>

            {/* Demodulation Diagnostic Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
                <span className="text-[#869397] text-[10px] block">CFO Offset:</span>
                <strong className="text-[#4edea3]">+18 Hz (Locked)</strong>
              </div>
              <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
                <span className="text-[#869397] text-[10px] block">Phase Jitter:</span>
                <strong className="text-[#dfe2f1]">±1.4° RMS</strong>
              </div>
              <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
                <span className="text-[#869397] text-[10px] block">MER (SNR in-band):</span>
                <strong className="text-[#4cd7f6]">28.4 dB</strong>
              </div>
              <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
                <span className="text-[#869397] text-[10px] block">Symbol Lock:</span>
                <strong className="text-[#4edea3]">LOCKED (100%)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
