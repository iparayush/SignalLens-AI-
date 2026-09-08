import React, { useState, useMemo } from 'react';
import { SignalProfile } from '../types';
import { Network, Activity, Layers, RotateCcw } from 'lucide-react';
import { welchPSD, type WindowType } from '../lib/dsp/fft';

interface SignalAnalysisViewProps {
  activeSignal: SignalProfile;
}

export const SignalAnalysisView: React.FC<SignalAnalysisViewProps> = ({ activeSignal }) => {
  const [fftWindow, setFftWindow] = useState<'Hamming' | 'Blackman-Harris' | 'Flat-Top'>('Blackman-Harris');
  const [rbw, setRbw] = useState<'5 kHz' | '10 kHz' | '25 kHz'>('10 kHz');
  const [colormap, setColormap] = useState<'tactical' | 'viridis' | 'inferno'>('tactical');

  // Map window string to WindowType
  const windowType: WindowType = useMemo(() => {
    switch (fftWindow) {
      case 'Hamming':
        return 'hamming';
      case 'Flat-Top':
        return 'flat-top';
      default:
        return 'blackman-harris';
    }
  }, [fftWindow]);

  // Dynamically recomputed or cached PSD
  const activePsd = useMemo(() => {
    if (activeSignal.rawIQ && activeSignal.rawIQ.length >= 128) {
      const fftSize = rbw === '5 kHz' ? 4096 : rbw === '10 kHz' ? 2048 : 1024;
      return welchPSD(activeSignal.rawIQ, fftSize, 0.5, windowType);
    }
    return activeSignal.psdSpectrum || null;
  }, [activeSignal.rawIQ, activeSignal.psdSpectrum, rbw, windowType]);

  // Scaled SVG Path calculation (600 × 240)
  const { strokePath, fillPath, peakMarker, peakPowerDb, noiseFloorDb } = useMemo(() => {
    const width = 600;
    const height = 240;

    if (activePsd && activePsd.length > 10) {
      let minVal = Infinity;
      let maxVal = -Infinity;
      let maxIdx = 0;

      for (let i = 0; i < activePsd.length; i++) {
        if (activePsd[i] < minVal) minVal = activePsd[i];
        if (activePsd[i] > maxVal) {
          maxVal = activePsd[i];
          maxIdx = i;
        }
      }
      if (maxVal - minVal < 1) maxVal = minVal + 10;

      const numPoints = Math.min(300, activePsd.length);
      const stride = activePsd.length / numPoints;
      const points: string[] = [];

      for (let i = 0; i < numPoints; i++) {
        const binIdx = Math.min(Math.floor(i * stride), activePsd.length - 1);
        const x = (i / (numPoints - 1)) * width;
        const norm = (activePsd[binIdx] - minVal) / (maxVal - minVal);
        const y = 220 - norm * 190;
        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }

      const peakNormX = (maxIdx / (activePsd.length - 1)) * width;
      const peakY = 220 - ((maxVal - minVal) / (maxVal - minVal)) * 190;

      return {
        strokePath: `M ${points.join(' L ')}`,
        fillPath: `M ${points.join(' L ')} L ${width} ${height} L 0 ${height} Z`,
        peakMarker: { x: peakNormX, y: peakY },
        peakPowerDb: maxVal,
        noiseFloorDb: minVal,
      };
    }

    // Default fallback
    return {
      strokePath:
        'M 0 220 L 50 218 L 100 216 L 150 212 L 200 205 L 230 180 L 250 110 L 275 42 L 300 30 L 325 45 L 350 115 L 370 182 L 400 206 L 450 213 L 500 217 L 600 220',
      fillPath:
        'M 0 220 L 50 218 L 100 216 L 150 212 L 200 205 L 230 180 L 250 110 L 275 42 L 300 30 L 325 45 L 350 115 L 370 182 L 400 206 L 450 213 L 500 217 L 600 220 L 600 240 L 0 240 Z',
      peakMarker: { x: 300, y: 30 },
      peakPowerDb: -11.8,
      noiseFloorDb: -82.4,
    };
  }, [activePsd]);

  // Demodulated constellation points
  const constellationPoints = useMemo(() => {
    if (activeSignal.demodulationResult?.constellation && activeSignal.demodulationResult.constellation.length > 0) {
      const rawPoints = activeSignal.demodulationResult.constellation.slice(0, 250);
      let maxAbs = 0.1;
      for (const pt of rawPoints) {
        maxAbs = Math.max(maxAbs, Math.abs(pt.i), Math.abs(pt.q));
      }

      return rawPoints.map((pt, idx) => ({
        cx: 100 + (pt.i / maxAbs) * 70,
        cy: 100 - (pt.q / maxAbs) * 70,
        r: 1.8,
        key: idx,
      }));
    }
    return null;
  }, [activeSignal.demodulationResult]);

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
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  fftWindow === w ? 'bg-[#4cd7f6] text-[#003640] font-bold' : 'text-[#bcc9cd] hover:text-[#dfe2f1]'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#0a0e18] px-2 py-1 rounded border border-[#313540] text-xs font-mono">
            <span className="text-[#869397]">RBW:</span>
            {(['5 kHz', '10 kHz', '25 kHz'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRbw(r)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  rbw === r ? 'bg-[#4cd7f6] text-[#003640] font-bold' : 'text-[#bcc9cd] hover:text-[#dfe2f1]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#0a0e18] px-2 py-1 rounded border border-[#313540] text-xs font-mono">
            <span className="text-[#869397]">Colormap:</span>
            {(['tactical', 'viridis', 'inferno'] as const).map((cm) => (
              <button
                key={cm}
                onClick={() => setColormap(cm)}
                className={`px-2 py-0.5 rounded uppercase cursor-pointer transition-colors ${
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
              <span className="text-[#869397]">Window: {fftWindow}</span>
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
              <line
                x1={peakMarker.x}
                y1="0"
                x2={peakMarker.x}
                y2="240"
                stroke="#4edea3"
                strokeDasharray="4 2"
                strokeWidth="1"
                opacity="0.7"
              />

              {/* PSD Curve Fill */}
              <path d={fillPath} fill="url(#spectrumGradientLarge)" />
              <path d={strokePath} fill="none" stroke="#4cd7f6" strokeWidth="2.2" />

              {/* Peak marker flag */}
              <circle cx={peakMarker.x} cy={peakMarker.y} r="4" fill="#4edea3" stroke="#003824" strokeWidth="2" />
            </svg>

            <div className="absolute top-3 left-4 font-mono text-[10px] bg-[#0a0e18]/90 px-2 py-1 rounded border border-[#313540] flex items-center gap-2">
              <span className="text-[#4edea3] font-bold">
                ▲ MARKER 1: {activeSignal.fcFormatted} ({peakPowerDb.toFixed(1)} dBm)
              </span>
              <span className="text-[#869397]">| SNR: +{activeSignal.telemetry.estimatedSnrDb.toFixed(1)} dB</span>
            </div>

            <div className="absolute bottom-3 right-4 font-mono text-[10px] bg-[#0a0e18]/90 px-2 py-1 rounded border border-[#313540] text-[#4cd7f6]">
              Occupied BW: {activeSignal.telemetry.bandwidthMHz.toFixed(2)} MHz (99.0% Power)
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#869397] pt-1">
            <span>Start: {(activeSignal.centerCarrierMHz - 2.5).toFixed(3)} MHz</span>
            <span>Center: {activeSignal.fcFormatted}</span>
            <span>Stop: {(activeSignal.centerCarrierMHz + 2.5).toFixed(3)} MHz (Span: 5.000 MHz)</span>
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
              EVM: {activeSignal.evmRms.toFixed(1)}% RMS
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

              {/* Real or clustered constellation points */}
              {constellationPoints ? (
                <g fill="#4cd7f6" opacity="0.8">
                  {constellationPoints.map((pt) => (
                    <circle key={pt.key} cx={pt.cx} cy={pt.cy} r={pt.r} />
                  ))}
                </g>
              ) : (
                [
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
                ))
              )}
            </svg>

            <span className="absolute top-2 right-3 font-mono text-[9px] text-[#869397]">Q: Quadrature</span>
            <span className="absolute bottom-2 right-3 font-mono text-[9px] text-[#869397]">I: In-Phase</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#bcc9cd]">
            <div className="bg-[#1c1f2a] p-2 rounded border border-[#313540]">
              <span className="text-[#869397] text-[10px] block">Phase Jitter:</span>
              <strong className="text-[#dfe2f1]">±{activeSignal.phaseJitterDeg.toFixed(1)}° RMS</strong>
            </div>
            <div className="bg-[#1c1f2a] p-2 rounded border border-[#313540]">
              <span className="text-[#869397] text-[10px] block">CFO / Carrier:</span>
              <strong className="text-[#4edea3]">
                {activeSignal.demodulationResult ? `${activeSignal.demodulationResult.cfoHz.toFixed(1)} Hz` : '1.42% Peak'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
