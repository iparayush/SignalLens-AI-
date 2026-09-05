import React from 'react';
import { CorrelationData } from '../types';
import { Radar } from 'lucide-react';

interface CorrelationPanelProps {
  correlation: CorrelationData;
}

export const CorrelationPanel: React.FC<CorrelationPanelProps> = ({ correlation }) => {
  return (
    <section
      id="correlation-preamble-section"
      className="flex flex-col gap-2.5 bg-[#171b26] p-4 rounded shadow-md border border-[#262a35]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="text-[#4cd7f6] w-4 h-4" />
          <h2 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-[#dfe2f1]">
            Correlation &amp; Preamble Detection
          </h2>
        </div>
        <span className="font-mono text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded font-bold border border-[#4edea3]/20">
          LOCKED
        </span>
      </div>

      {/* Technical Readout Pill Stack */}
      <div className="flex flex-col gap-1.5 bg-[#1c1f2a] p-3 rounded shadow-sm border border-[#313540]">
        <div className="flex items-center justify-between pb-1 border-b border-[#262a35]">
          <span className="font-mono text-[10px] text-[#869397] uppercase">Pattern / Header</span>
          <span className="font-mono text-[11px] text-[#4cd7f6] font-bold">
            {correlation.patternName}
          </span>
        </div>
        <div className="font-mono text-[13px] text-[#4edea3] bg-[#0a0e18] px-2 py-1 rounded font-bold border border-[#262a35]">
          Sync Preamble: {correlation.syncPreambleHex}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-[10px] text-[#869397] uppercase">Detected Position</span>
          <span className="font-mono text-[11px] text-[#dfe2f1] font-bold">
            Offset: {correlation.detectedPositionOffset}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#869397] uppercase">Bit Location</span>
          <span className="font-mono text-[11px] text-[#4cd7f6]">{correlation.bitLocation}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#869397] uppercase">Confidence Metric</span>
          <span className="font-mono text-[11px] text-[#4edea3] font-bold">
            {correlation.confidence.toFixed(1)}% Peak Correlation
          </span>
        </div>
      </div>

      {/* Sharp Correlation Spike Graph Canvas */}
      <div className="flex flex-col gap-1.5 bg-[#0a0e18] p-3 rounded flex-1 justify-between shadow-sm border border-[#262a35]">
        <div className="flex items-center justify-between font-mono text-[11px] text-[#869397]">
          <span className="uppercase">Cross-Correlation Function</span>
          <span className="text-[#4edea3] font-mono font-bold">
            +{correlation.crossCorrPsrDb.toFixed(1)} dB PSR
          </span>
        </div>

        <div className="relative w-full h-32 bg-[#262a35]/30 rounded overflow-hidden flex items-center justify-center border border-[#171b26]">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 280 120">
            {/* Noise Floor Region */}
            <rect x="0" y="80" width="280" height="40" fill="rgba(6,182,212,0.04)" />

            {/* Threshold Line */}
            <line
              x1="0"
              y1="75"
              x2="280"
              y2="75"
              stroke="#93000a"
              strokeDasharray="3 2"
              strokeWidth="1"
              opacity="0.7"
            />

            {/* Baseline noise ripple with massive sharp peak at x=140 */}
            <path
              d="M 0 100 Q 15 92, 30 102 T 60 98 T 90 104 T 110 97 T 125 101 L 138 98 L 140 14 L 142 98 L 155 102 T 180 97 T 210 103 T 240 98 T 280 101"
              fill="none"
              stroke="#4cd7f6"
              strokeWidth="1.6"
            />

            {/* Peak Target Identifier */}
            <circle cx="140" cy="14" r="3.5" fill="#4edea3" stroke="#003824" strokeWidth="1.5" />
            <line
              x1="140"
              y1="14"
              x2="140"
              y2="120"
              stroke="#4edea3"
              strokeDasharray="2 2"
              strokeWidth="1"
              opacity="0.8"
            />
          </svg>

          <span className="absolute top-1 left-1/2 transform -translate-x-1/2 font-mono text-[9px] text-[#4edea3] font-bold bg-[#0a0e18]/85 px-1.5 py-0.5 rounded border border-[#4edea3]/30 shadow-sm">
            SYNC DETECT (+{correlation.crossCorrPsrDb.toFixed(1)} dB)
          </span>
          <span className="absolute bottom-1 left-2 font-mono text-[9px] text-[#869397]">
            Noise Floor ({correlation.noiseFloorDb.toFixed(0)} dB)
          </span>
          <span className="absolute top-12 left-2 font-mono text-[9px] text-[#ffb4ab] font-mono">
            Det. Threshold (+{correlation.detThresholdDb.toFixed(0)}dB)
          </span>
        </div>

        <div className="flex items-center justify-between text-[#869397] font-mono text-[10px] pt-1">
          <span>Cross-Corr Length: {correlation.crossCorrLength}</span>
          <span className="text-[#4edea3] font-bold">
            Peak-to-Sidelobe: {correlation.peakToSidelobeStatus}
          </span>
        </div>
      </div>
    </section>
  );
};
