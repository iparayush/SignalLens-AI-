import React, { useState } from 'react';
import { SignalProfile } from '../types';
import { Network, Activity, Radio, Eye, RefreshCw, ZoomIn, ZoomOut, Layers } from 'lucide-react';

interface SignalAnalysisViewProps {
  activeSignal: SignalProfile;
}

export const SignalAnalysisView: React.FC<SignalAnalysisViewProps> = ({ activeSignal }) => {
  const [fftWindow, setFftWindow] = useState<'Hamming' | 'Blackman-Harris' | 'Flat-Top'>('Blackman-Harris');
  const [rbw, setRbw] = useState<'5 kHz' | '10 kHz' | '25 kHz'>('10 kHz');
  const [colormap, setColormap] = useState<'tactical' | 'viridis' | 'inferno'>('tactical');
  const [displayMode, setDisplayMode] = useState<'all' | 'spectrum' | 'constellation'>('all');

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#171b26] p-4 rounded border border-[#262a35]">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-[#4cd7f6]" />
            <h1 className="font-headline text-xl font-bold text-[#dfe2f1]">
              High-Precision Multi-Domain Signal Analysis Suite
            </h1>
          </div>
          <p className="font-mono text-xs text-[#869397] mt-1">
            Real-time RF spectrogram, Welch power spectral density, time-domain waveform, and constellation analyzer.
          </p>
        </div>

        {/* Quick Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#0a0e18] px-2 py-1 rounded border border-[#313540] text-xs font-mono">
            <span className="text-[#869397]">Window:</span>
            {(['Hamming', 'Blackman-Harris', 'Flat-Top'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setFftWindow(w)}
                className={`px-2 py-0.5 rounded ${
                  fftWindow === w ? 'bg-[#4cd7f6] text-[#003640] font-bold' : 'text-[#bcc9cd] hover:text-[#dfe2f1]'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#0a0e18] px-2 py-1 rounded border border-[#313540] text-xs font-mono">
            <span className="text-[#869397]">Colormap:</span>
            {(['tactical', 'viridis', 'inferno'] as const).map((cm) => (
              <button
                key={cm}
                onClick={() => setColormap(cm)}
                className={`px-2 py-0.5 rounded uppercase ${
                  colormap === cm ? 'bg-[#4edea3] text-[#003824] font-bold' : 'text-[#bcc9cd] hover:text-[#dfe2f1]'
                }`}
              >
                {cm}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Expanded Quad Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Expanded Spectrum Analyzer */}
        <div className="col-span-12 lg:col-span-8 bg-[#171b26] p-4 rounded border border-[#262a35] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#4cd7f6]" />
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#dfe2f1]">
                Power Spectral Density (PSD) &amp; RF Frequency Domain
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-[#4cd7f6]">Fc: {activeSignal.fcFormatted}</span>
              <span className="text-[#4edea3]">RBW: {rbw}</span>
              <span className="text-[#869397]">FFT Size: 4096</span>
            </div>
          </div>

          {/* High-Resolution Spectrum Graph */}
          <div className="relative w-full h-72 bg-[#0a0e18] rounded border border-[#262a35] overflow-hidden flex items-center justify-center p-2">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 240">
              <defs>
                <linearGradient id="spectrumGradientLarge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.7" />
                  <stop offset="60%" stopColor="#0566d9" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0a0e18" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[40, 80, 120, 160, 200].map((y) => (
                <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#171b26" strokeWidth="1" />
              ))}
              {[100, 200, 300, 400, 500].map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2="240" stroke="#171b26" strokeWidth="1" />
              ))}

              {/* Bandwidth passband highlight */}
              <rect x="220" y="20" width="160" height="200" fill="rgba(76, 215, 246, 0.06)" />
              <line x1="220" y1="20" x2="220" y2="220" stroke="#4cd7f6" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />
              <line x1="380" y1="20" x2="380" y2="220" stroke="#4cd7f6" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />

              {/* Peak Marker Line */}
              <line x1="300" y1="0" x2="300" y2="240" stroke="#4edea3" strokeDasharray="4 2" strokeWidth="1" opacity="0.7" />

              {/* PSD Curve Fill */}
              <path
                d="M 0 220 L 50 218 L 100 216 L 150 212 L 200 205 L 230 180 L 250 110 L 275 42 L 300 30 L 325 45 L 350 115 L 370 182 L 400 206 L 450 213 L 500 217 L 600 220 L 600 240 L 0 240 Z"
                fill="url(#spectrumGradientLarge)"
              />
              <path
                d="M 0 220 L 50 218 L 100 216 L 150 212 L 200 205 L 230 180 L 250 110 L 275 42 L 300 30 L 325 45 L 350 115 L 370 182 L 400 206 L 450 213 L 500 217 L 600 220"
                fill="none"
                stroke="#4cd7f6"
                strokeWidth="2.2"
              />

              {/* Peak marker flag */}
              <circle cx="300" cy="30" r="4" fill="#4edea3" stroke="#003824" strokeWidth="2" />
            </svg>

            <div className="absolute top-3 left-4 font-mono text-[10px] bg-[#0a0e18]/90 px-2 py-1 rounded border border-[#313540] flex items-center gap-2">
              <span className="text-[#4edea3] font-bold">▲ MARKER 1: 433.920 MHz (-11.8 dBm)</span>
              <span className="text-[#869397]">| SNR: +24.8 dB</span>
            </div>

            <div className="absolute bottom-3 right-4 font-mono text-[10px] bg-[#0a0e18]/90 px-2 py-1 rounded border border-[#313540] text-[#4cd7f6]">
              Occupied BW: {activeSignal.telemetry.bandwidthMHz.toFixed(2)} MHz (99.0% Power)
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#869397] pt-1">
            <span>Start: 431.420 MHz</span>
            <span>Center: {activeSignal.fcFormatted}</span>
            <span>Stop: 436.420 MHz (Span: 5.000 MHz)</span>
          </div>
        </div>

        {/* Constellation & EVM Scope */}
        <div className="col-span-12 lg:col-span-4 bg-[#171b26] p-4 rounded border border-[#262a35] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#4cd7f6]" />
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#dfe2f1]">
                Demodulated Constellation
              </h2>
            </div>
            <span className="font-mono text-xs font-bold text-[#4edea3]">
              EVM: {activeSignal.evmRms}% RMS
            </span>
          </div>

          <div className="relative w-full h-72 bg-[#0a0e18] rounded border border-[#262a35] overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 200 200">
              {/* Axes */}
              <line x1="100" y1="10" x2="100" y2="190" stroke="#313540" strokeWidth="1" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="#313540" strokeWidth="1" />
              <circle cx="100" cy="100" r="65" fill="none" stroke="#1c1f2a" strokeDasharray="3 3" strokeWidth="1" />

              {/* Ideal Decision Slices */}
              <circle cx="55" cy="55" r="4" fill="none" stroke="#869397" strokeDasharray="2 2" />
              <circle cx="145" cy="55" r="4" fill="none" stroke="#869397" strokeDasharray="2 2" />
              <circle cx="55" cy="145" r="4" fill="none" stroke="#869397" strokeDasharray="2 2" />
              <circle cx="145" cy="145" r="4" fill="none" stroke="#869397" strokeDasharray="2 2" />

              {/* Clustered constellation points */}
              {[
                [145, 55],
                [55, 55],
                [55, 145],
                [145, 145],
              ].map(([cx, cy], i) => (
                <g key={i} fill="#4cd7f6" opacity="0.8">
                  <circle cx={cx - 2} cy={cy + 1} r="2.2" />
                  <circle cx={cx + 3} cy={cy - 2} r="1.8" />
                  <circle cx={cx - 1} cy={cy - 3} r="1.6" />
                  <circle cx={cx + 2} cy={cy + 3} r="2.0" />
                  <circle cx={cx - 4} cy={cy} r="1.5" />
                  <circle cx={cx + 1} cy={cy - 1} r="2.4" />
                </g>
              ))}
            </svg>

            <span className="absolute top-2 right-3 font-mono text-[9px] text-[#869397]">Q: Quadrature</span>
            <span className="absolute bottom-2 right-3 font-mono text-[9px] text-[#869397]">I: In-Phase</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#bcc9cd]">
            <div className="bg-[#1c1f2a] p-2 rounded border border-[#313540]">
              <span className="text-[#869397] text-[10px] block">Phase Jitter:</span>
              <strong className="text-[#dfe2f1]">±{activeSignal.phaseJitterDeg}° RMS</strong>
            </div>
            <div className="bg-[#1c1f2a] p-2 rounded border border-[#313540]">
              <span className="text-[#869397] text-[10px] block">Magnitude Error:</span>
              <strong className="text-[#4edea3]">1.42% Peak</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
