import React from 'react';
import { SignalProfile } from '../types';
import { Cpu, ShieldCheck, Waves, Grid, CheckCircle2 } from 'lucide-react';

interface DecodeViewProps {
  activeSignal: SignalProfile;
}

export const DecodeView: React.FC<DecodeViewProps> = ({ activeSignal }) => {
  return (
    <div className="flex flex-col w-full gap-5">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#171b26] p-4 rounded border border-[#262a35]">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#4cd7f6]" />
            <h1 className="font-headline text-xl font-bold text-[#dfe2f1]">
              DSP Pipeline Demodulation &amp; Trellis Decode Architecture
            </h1>
          </div>
          <p className="font-mono text-xs text-[#869397] mt-1">
            Costas carrier synchronization, Gardner symbol timing, 16×32 block de-interleaving, and Viterbi soft traceback.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#4edea3]/10 border border-[#4edea3]/30 px-3 py-1.5 rounded font-mono text-xs text-[#4edea3] font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>ZERO FRAME ERRORS (BER &lt; 10⁻⁶)</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Module 1: Carrier & Symbol Timing Synchronization */}
        <div className="col-span-12 lg:col-span-6 bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#4cd7f6]">
            <Waves className="w-4 h-4" />
            <span>01 • Costas Loop Carrier Recovery</span>
          </div>

          <div className="bg-[#0a0e18] p-4 rounded border border-[#262a35] flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1c1f2a] pb-2">
              <span className="text-[#869397]">Loop Bandwidth (BnT):</span>
              <span className="text-[#4cd7f6] font-bold">1.2 kHz (Normalized 0.001)</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#1c1f2a] pb-2">
              <span className="text-[#869397]">Damping Factor (ζ):</span>
              <span className="text-[#dfe2f1]">0.707 (Critically Damped)</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#1c1f2a] pb-2">
              <span className="text-[#869397]">Residual Frequency Offset:</span>
              <span className="text-[#4edea3] font-bold">+18 Hz (Locked)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#869397]">Phase Detector Slicer:</span>
              <span className="text-[#adc6ff]">Quadrant Sign(I)*Q - Sign(Q)*I</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#1c1f2a] p-3 rounded text-xs font-mono text-[#bcc9cd] border border-[#313540]">
            <CheckCircle2 className="w-4 h-4 text-[#4edea3] shrink-0" />
            <span>Carrier phase lock confirmed at sample #142 (Lock time: 1.8 ms). Constellation de-rotation locked.</span>
          </div>
        </div>

        {/* Module 2: Block De-Interleaver Matrix */}
        <div className="col-span-12 lg:col-span-6 bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#4cd7f6]">
              <Grid className="w-4 h-4" />
              <span>02 • 16×32 Matrix De-Interleaver</span>
            </div>
            <span className="font-mono text-xs text-[#4edea3]">Sync: LOCKED</span>
          </div>

          {/* Matrix Grid Visualization */}
          <div className="bg-[#0a0e18] p-3 rounded border border-[#262a35] flex flex-col gap-1">
            <div className="text-[10px] font-mono text-[#869397] mb-1 flex justify-between">
              <span>Rows: 16 (Temporal Depth)</span>
              <span>Cols: 32 (Burst Dispersion)</span>
            </div>
            <div className="grid grid-cols-16 gap-1 h-28 overflow-hidden bg-[#171b26] p-2 rounded">
              {Array.from({ length: 96 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 rounded-xs ${
                    i % 3 === 0
                      ? 'bg-[#4cd7f6]'
                      : i % 5 === 0
                      ? 'bg-[#4edea3]'
                      : 'bg-[#262a35]'
                  }`}
                  title={`Bit Cell #${i}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
              <span className="text-[#869397] text-[10px] block uppercase">Fading Immunity:</span>
              <strong className="text-[#4edea3]">Up to 32 bits continuous</strong>
            </div>
            <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
              <span className="text-[#869397] text-[10px] block uppercase">Memory Buffer:</span>
              <strong className="text-[#dfe2f1]">512 bits (2x ping-pong)</strong>
            </div>
          </div>
        </div>

        {/* Module 3: Viterbi Trellis FEC Decoder */}
        <div className="col-span-12 bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#4cd7f6]">
              <ShieldCheck className="w-4 h-4" />
              <span>03 • Viterbi Soft-Decision FEC Decoder (K=7, Rate 1/2)</span>
            </div>
            <span className="font-mono text-xs text-[#4edea3] font-bold">
              Coding Gain: +5.2 dB
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#0a0e18] p-3 rounded border border-[#262a35] flex flex-col gap-1.5">
              <span className="text-[#869397] text-[10px] uppercase">Polynomials</span>
              <span className="text-[#dfe2f1] font-bold">G1 = 171 (Octal)</span>
              <span className="text-[#dfe2f1] font-bold">G2 = 133 (Octal)</span>
              <span className="text-[#869397] text-[11px] mt-1">Constraint Length K = 7 (64 Trellis States)</span>
            </div>

            <div className="bg-[#0a0e18] p-3 rounded border border-[#262a35] flex flex-col gap-1.5">
              <span className="text-[#869397] text-[10px] uppercase">Traceback Metric</span>
              <span className="text-[#4cd7f6] font-bold">Depth = 35 states</span>
              <span className="text-[#4edea3] font-bold">Soft Metric: 3-bit Euclidean</span>
              <span className="text-[#869397] text-[11px] mt-1">Zero state-survivor pruning errors</span>
            </div>

            <div className="bg-[#0a0e18] p-3 rounded border border-[#262a35] flex flex-col gap-1.5">
              <span className="text-[#869397] text-[10px] uppercase">Frame Integrity</span>
              <span className="text-[#4edea3] font-bold">Uncorrected Frame Errors: 0</span>
              <span className="text-[#dfe2f1]">Decoded Frames: 120 / 120</span>
              <span className="text-[#4cd7f6] font-bold mt-1">Checksum CRC-32: PASS (0x8F4E21)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
