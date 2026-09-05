import React from 'react';
import { SignalProfile } from '../types';
import { Radar, Cpu, Award, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DetectionResultsViewProps {
  activeSignal: SignalProfile;
}

export const DetectionResultsView: React.FC<DetectionResultsViewProps> = ({ activeSignal }) => {
  const modProbabilities = [
    { name: 'QPSK', prob: 99.4, color: '#4cd7f6' },
    { name: 'BPSK', prob: 0.3, color: '#869397' },
    { name: '8PSK', prob: 0.1, color: '#869397' },
    { name: '16-QAM', prob: 0.1, color: '#869397' },
    { name: '2-FSK', prob: 0.05, color: '#869397' },
    { name: 'GMSK', prob: 0.05, color: '#869397' },
  ];

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#171b26] p-4 rounded border border-[#262a35]">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-[#4cd7f6]" />
            <h1 className="font-headline text-xl font-bold text-[#dfe2f1]">
              Automated Modulation Classification &amp; Neural Inference
            </h1>
          </div>
          <p className="font-mono text-xs text-[#869397] mt-1">
            Deep ResNet-18 model combined with Cyclostationary Auto-Correlation Features (CAF).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#4edea3]/10 border border-[#4edea3]/30 px-3 py-1.5 rounded font-mono text-xs text-[#4edea3] font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>CLASSIFICATION CONFIRMED: {activeSignal.telemetry.modulation}</span>
        </div>
      </div>

      {/* Grid: Probability Bar Chart & Model Telemetry */}
      <div className="grid grid-cols-12 gap-5">
        {/* Probability Breakdown */}
        <div className="col-span-12 lg:col-span-6 bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#dfe2f1]">
              Modulation Softmax Confidence Distribution
            </h2>
            <span className="font-mono text-xs text-[#4cd7f6]">Inference: 23.4 ms</span>
          </div>

          <div className="flex flex-col gap-3">
            {modProbabilities.map((item) => (
              <div key={item.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#dfe2f1]">{item.name}</span>
                  <span className={item.prob > 50 ? 'text-[#4cd7f6] font-bold' : 'text-[#869397]'}>
                    {item.prob.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-[#0a0e18] h-2.5 rounded overflow-hidden border border-[#262a35]">
                  <div
                    className="h-full rounded transition-all duration-700"
                    style={{
                      width: `${item.prob}%`,
                      backgroundColor: item.prob > 50 ? '#4cd7f6' : '#313540',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#0a0e18] rounded border border-[#262a35] text-xs font-mono text-[#bcc9cd]">
            <span className="text-[#869397] block mb-1">Decision Metric:</span>
            Cross-entropy margin: <span className="text-[#4edea3] font-bold">Δ = 99.1%</span> over second runner-up (BPSK). Modulation uniquely classified with high confidence.
          </div>
        </div>

        {/* Cyclostationary Feature Matrix */}
        <div className="col-span-12 lg:col-span-6 bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#dfe2f1]">
            Cyclostationary Spectral Correlation Function (SCF)
          </h2>

          {/* Visual SCF Peak Representation */}
          <div className="relative w-full h-48 bg-[#0a0e18] rounded border border-[#262a35] flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 300 150">
              <defs>
                <radialGradient id="scfGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#0566d9" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0a0e18" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Grid 3D Iso Lines */}
              <line x1="20" y1="130" x2="280" y2="130" stroke="#1c1f2a" strokeWidth="1" />
              <line x1="150" y1="20" x2="150" y2="130" stroke="#1c1f2a" strokeWidth="1" />

              {/* SCF Cyclic Symmetrical Peaks at +/- alpha */}
              <circle cx="150" cy="75" r="45" fill="url(#scfGlow)" />
              <circle cx="90" cy="95" r="25" fill="url(#scfGlow)" opacity="0.6" />
              <circle cx="210" cy="95" r="25" fill="url(#scfGlow)" opacity="0.6" />

              {/* Center crosshair */}
              <line x1="140" y1="75" x2="160" y2="75" stroke="#4edea3" strokeWidth="1" />
              <line x1="150" y1="65" x2="150" y2="85" stroke="#4edea3" strokeWidth="1" />
            </svg>

            <span className="absolute top-2 left-3 font-mono text-[10px] text-[#4cd7f6]">
              α (Cyclic Frequency): 1.200 MHz
            </span>
            <span className="absolute bottom-2 right-3 font-mono text-[10px] text-[#4edea3]">
              Symbol Clock Sync: VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
              <span className="text-[#869397] text-[10px] block uppercase">Baud Rate Derived:</span>
              <strong className="text-[#4cd7f6]">1.200 MBaud (±24 Hz)</strong>
            </div>
            <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
              <span className="text-[#869397] text-[10px] block uppercase">Spectral Roll-Off (α):</span>
              <strong className="text-[#4edea3]">0.35 Root-Raised Cosine</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
