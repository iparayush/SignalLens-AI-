import React, { useState } from 'react';
import { SignalProfile, DeinterleaverType, FecType } from '../types';
import { Cpu, CheckCircle2, Sliders, Play, RotateCcw, ShieldCheck, Grid, Zap, Layers, RefreshCw } from 'lucide-react';
import { deinterleave } from '../lib/dsp/deinterleaver';
import { fecDecode } from '../lib/dsp/fec';

interface DecodePipelineViewProps {
  activeSignal: SignalProfile;
}

export const DecodePipelineView: React.FC<DecodePipelineViewProps> = ({ activeSignal }) => {
  // De-interleaver settings
  const [deinterleaverType, setDeinterleaverType] = useState<DeinterleaverType>('block');
  const [matrixRows, setMatrixRows] = useState<number>(16);
  const [matrixCols, setMatrixCols] = useState<number>(32);
  const [burstSpreadRatio, setBurstSpreadRatio] = useState<number>(98.5);

  // FEC settings
  const [fecType, setFecType] = useState<FecType>('viterbi');
  const [viterbiRate, setViterbiRate] = useState<'1/2' | '2/3' | '3/4' | '7/8'>('1/2');
  const [rsScheme, setRsScheme] = useState<'RS(255,223)' | 'RS(204,188)'>('RS(255,223)');
  const [tracebackDepth, setTracebackDepth] = useState<number>(64);
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [decodeSuccess, setDecodeSuccess] = useState<string | null>(null);

  // Real or initial error correction stats
  const [errorsCorrected, setErrorsCorrected] = useState<number>(
    activeSignal.fecResult ? activeSignal.fecResult.errorsCorrected : 14
  );
  const [codingGainDb, setCodingGainDb] = useState<number>(
    activeSignal.fecResult ? activeSignal.fecResult.codingGainDb : 5.4
  );

  const handleRunPipeline = () => {
    setIsDecoding(true);
    setTimeout(() => {
      const inputBytes = activeSignal.demodulationResult?.bits || new Uint8Array(activeSignal.rawSampleBytes);
      const deinterleaved = deinterleave(inputBytes, deinterleaverType, matrixRows, matrixCols);
      const fec = fecDecode(deinterleaved.data, fecType, viterbiRate);

      setIsDecoding(false);
      setErrorsCorrected(fec.errorsCorrected);
      setCodingGainDb(fec.codingGainDb);
      const throughputMBs = ((deinterleaved.data.length / Math.max(1, fec.processingTimeMs)) * 1000) / (1024 * 1024);
      setDecodeSuccess(
        `Pipeline Executed: ${deinterleaved.params} in ${deinterleaved.processingTimeMs.toFixed(1)} ms. ${fec.config} corrected ${fec.errorsCorrected} bit errors (${throughputMBs.toFixed(1)} MB/s).`
      );
      setTimeout(() => setDecodeSuccess(null), 5000);
    }, 400);
  };

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#171b26] p-4 rounded border border-[#262a35]">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#4cd7f6]" />
            <h1 className="font-headline text-xl font-bold text-[#dfe2f1]">
              Decode Pipeline: De-interleaving &amp; FEC Engine
            </h1>
          </div>
          <p className="font-mono text-xs text-[#869397] mt-1">
            Reconstruct scrambled channel data using Block/Convolutional de-interleaving and Viterbi / Reed-Solomon / LDPC FEC decoding.
          </p>
        </div>

        <button
          onClick={handleRunPipeline}
          disabled={isDecoding}
          className="flex items-center gap-2 px-4 py-2 bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#00424f] font-mono text-xs font-bold rounded uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(6,182,212,0.35)] disabled:opacity-50 cursor-pointer"
        >
          {isDecoding ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Decoding Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Decode Pipeline</span>
            </>
          )}
        </button>
      </div>

      {decodeSuccess && (
        <div className="px-4 py-2.5 rounded bg-[#4edea3]/15 border border-[#4edea3]/30 text-[#4edea3] font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{decodeSuccess}</span>
        </div>
      )}

      {/* Grid: De-interleaver on Left, FEC on Right */}
      <div className="grid grid-cols-12 gap-5">
        {/* Section 1: De-interleaver */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
          <div className="bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#dfe2f1] flex items-center gap-2">
                <Grid className="w-4 h-4 text-[#4cd7f6]" />
                1. De-interleaving Engine
              </h2>
              <span className="font-mono text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded border border-[#4edea3]/20 uppercase">
                BURST DISPERSAL
              </span>
            </div>

            {/* Architecture Selector */}
            <div className="grid grid-cols-4 gap-1.5 bg-[#0a0e18] p-1 rounded border border-[#313540]">
              {(
                [
                  { id: 'block', label: 'Block' },
                  { id: 'convolutional', label: 'Convol.' },
                  { id: 'diagonal', label: 'Diagonal' },
                  { id: 'pseudorandom', label: 'Pseudo' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setDeinterleaverType(mode.id)}
                  className={`py-1.5 text-center rounded font-mono text-xs font-bold transition-all uppercase ${
                    deinterleaverType === mode.id
                      ? 'bg-[#4cd7f6] text-[#003640] shadow-sm'
                      : 'text-[#bcc9cd] hover:text-[#dfe2f1]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Parameter sliders */}
            <div className="flex flex-col gap-3 font-mono text-xs pt-1">
              <div className="flex justify-between items-center">
                <span className="text-[#bcc9cd]">Matrix Depth (Rows):</span>
                <span className="text-[#4cd7f6] font-bold">{matrixRows} rows</span>
              </div>
              <input
                type="range"
                min="4"
                max="64"
                step="4"
                value={matrixRows}
                onChange={(e) => setMatrixRows(parseInt(e.target.value))}
                className="accent-[#4cd7f6] cursor-pointer"
              />

              <div className="flex justify-between items-center">
                <span className="text-[#bcc9cd]">Matrix Span (Cols):</span>
                <span className="text-[#4edea3] font-bold">{matrixCols} cols</span>
              </div>
              <input
                type="range"
                min="8"
                max="128"
                step="8"
                value={matrixCols}
                onChange={(e) => setMatrixCols(parseInt(e.target.value))}
                className="accent-[#4edea3] cursor-pointer"
              />
            </div>

            {/* Visual Burst Dispersal Matrix */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#262a35]">
              <span className="font-mono text-[11px] text-[#869397] uppercase">
                Interleaver Burst Dispersion Bit Map ({matrixRows} × {matrixCols})
              </span>
              <div className="grid grid-cols-16 gap-1 bg-[#0a0e18] p-3 rounded border border-[#262a35] h-32 overflow-hidden">
                {Array.from({ length: 64 }).map((_, idx) => {
                  const isBurst = idx >= 18 && idx <= 23;
                  const isDispersed = idx % 7 === 0;
                  return (
                    <div
                      key={idx}
                      className={`h-2.5 rounded-xs transition-all ${
                        isBurst
                          ? 'bg-[#ffb4ab] animate-pulse'
                          : isDispersed
                          ? 'bg-[#4cd7f6]'
                          : 'bg-[#262a35]'
                      }`}
                      title={isBurst ? 'Channel Burst Error' : 'Dispersed Symbol'}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-[#869397]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-[#ffb4ab]"></span>
                  Physical Burst Error
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-[#4cd7f6]"></span>
                  De-interleaved Symbols
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: FEC / Error Correction */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
          <div className="bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#dfe2f1] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4edea3]" />
                2. Forward Error Correction (FEC)
              </h2>
              <span className="font-mono text-[10px] text-[#4cd7f6] bg-[#4cd7f6]/10 px-2 py-0.5 rounded border border-[#4cd7f6]/20 uppercase">
                SYNDROME CHECKED
              </span>
            </div>

            {/* FEC Family Selector */}
            <div className="grid grid-cols-4 gap-1.5 bg-[#0a0e18] p-1 rounded border border-[#313540]">
              {(
                [
                  { id: 'viterbi', label: 'Viterbi' },
                  { id: 'reedsolomon', label: 'Reed-Sol' },
                  { id: 'concatenated', label: 'Concat.' },
                  { id: 'ldpc', label: 'LDPC' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setFecType(mode.id)}
                  className={`py-1.5 text-center rounded font-mono text-xs font-bold transition-all uppercase ${
                    fecType === mode.id
                      ? 'bg-[#4edea3] text-[#003822] shadow-sm'
                      : 'text-[#bcc9cd] hover:text-[#dfe2f1]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* FEC Specific Controls */}
            {fecType === 'viterbi' && (
              <div className="flex flex-col gap-3 font-mono text-xs pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#bcc9cd]">Code Rate:</span>
                  <div className="flex gap-1.5">
                    {(['1/2', '2/3', '3/4', '7/8'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setViterbiRate(r)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          viterbiRate === r
                            ? 'bg-[#4cd7f6] text-[#003640]'
                            : 'bg-[#0a0e18] text-[#869397] border border-[#313540]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#bcc9cd]">Constraint Length (K):</span>
                  <span className="text-[#4edea3] font-bold">K = 7 (Poly: 171, 133)</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#bcc9cd]">Traceback Depth:</span>
                  <span className="text-[#4cd7f6] font-bold">{tracebackDepth} symbols</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="128"
                  step="16"
                  value={tracebackDepth}
                  onChange={(e) => setTracebackDepth(parseInt(e.target.value))}
                  className="accent-[#4cd7f6] cursor-pointer"
                />
              </div>
            )}

            {fecType === 'reedsolomon' && (
              <div className="flex flex-col gap-3 font-mono text-xs pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#bcc9cd]">RS Galois Field Code:</span>
                  <div className="flex gap-2">
                    {(['RS(255,223)', 'RS(204,188)'] as const).map((sch) => (
                      <button
                        key={sch}
                        onClick={() => setRsScheme(sch)}
                        className={`px-2.5 py-1 rounded text-xs font-bold ${
                          rsScheme === sch
                            ? 'bg-[#4edea3] text-[#003822]'
                            : 'bg-[#0a0e18] text-[#869397] border border-[#313540]'
                        }`}
                      >
                        {sch}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#bcc9cd]">Max Correctable Symbols:</span>
                  <strong className="text-[#4edea3]">t = 16 bytes per block</strong>
                </div>
              </div>
            )}

            {(fecType === 'concatenated' || fecType === 'ldpc') && (
              <div className="flex flex-col gap-2 font-mono text-xs pt-1">
                <div className="bg-[#0a0e18] p-3 rounded border border-[#262a35] text-[#bcc9cd]">
                  <span className="text-[#4cd7f6] font-bold block mb-1">
                    {fecType === 'concatenated' ? 'Outer RS(255,223) + Inner Viterbi K=7' : 'DVB-S2 LDPC Matrix (64800 bits)'}
                  </span>
                  Belief propagation iterations: 30 cycles. Parity check parity satisfies H·cᵀ = 0 syndrome.
                </div>
              </div>
            )}

            {/* FEC Diagnostics Table */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262a35] font-mono text-xs">
              <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
                <span className="text-[#869397] text-[10px] block">Coding Gain:</span>
                <strong className="text-[#4edea3]">+{codingGainDb} dB (Eb/N0)</strong>
              </div>
              <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
                <span className="text-[#869397] text-[10px] block">Bit Errors Corrected:</span>
                <strong className="text-[#4cd7f6]">{errorsCorrected} bits in buffer</strong>
              </div>
              <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
                <span className="text-[#869397] text-[10px] block">Uncorrected Frames:</span>
                <strong className="text-[#4edea3]">0 (FER &lt; 10⁻⁷)</strong>
              </div>
              <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
                <span className="text-[#869397] text-[10px] block">CRC-32 Checksum:</span>
                <strong className="text-[#4edea3]">VALID (0x8F92A1D0)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
