import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SignalProfile } from '../types';
import { Activity, Radio } from 'lucide-react';
import { spectrogramToRGBA } from '../lib/dsp/spectrogram';

interface QuadrantVisualizerProps {
  activeSignal: SignalProfile;
}

export const QuadrantVisualizer: React.FC<QuadrantVisualizerProps> = ({ activeSignal }) => {
  const [animTick, setAnimTick] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subtle real-time oscillation for 60 FPS alive aesthetic
  useEffect(() => {
    let animId: number;
    const update = () => {
      setAnimTick((prev) => (prev + 1) % 360);
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  const phaseOffset = (animTick * 0.05) % (Math.PI * 2);

  // ─── 1. Time Domain Waveform Paths (Real or Fallback) ───
  const { iWavePath, qWavePath } = useMemo(() => {
    const width = 320;
    const height = 160;
    const midY = height / 2;

    if (activeSignal.rawIQ && activeSignal.rawIQ.length >= 64) {
      const numSamples = Math.min(128, activeSignal.rawIQ.length >> 1);
      const stride = Math.max(1, Math.floor((activeSignal.rawIQ.length >> 1) / 128));
      const iPoints: string[] = [];
      const qPoints: string[] = [];

      let maxAmp = 0.01;
      for (let s = 0; s < numSamples; s++) {
        const idx = s * stride * 2;
        maxAmp = Math.max(maxAmp, Math.abs(activeSignal.rawIQ[idx]), Math.abs(activeSignal.rawIQ[idx + 1]));
      }

      for (let s = 0; s < numSamples; s++) {
        const x = (s / (numSamples - 1)) * width;
        const idx = s * stride * 2;
        const iVal = activeSignal.rawIQ[idx] / maxAmp;
        const qVal = activeSignal.rawIQ[idx + 1] / maxAmp;

        const yI = midY - iVal * 60;
        const yQ = midY - qVal * 60;
        iPoints.push(`${x.toFixed(1)},${yI.toFixed(1)}`);
        qPoints.push(`${x.toFixed(1)},${yQ.toFixed(1)}`);
      }

      return {
        iWavePath: `M ${iPoints.join(' L ')}`,
        qWavePath: `M ${qPoints.join(' L ')}`,
      };
    }

    // Fallback animated sine wave
    const generateWaveformPath = (phase: number, amplitude: number) => {
      const points = [];
      for (let x = 0; x <= width; x += 10) {
        const freq = 0.08;
        const y = midY + Math.sin(x * freq + phase) * amplitude;
        points.push(`${x},${y.toFixed(1)}`);
      }
      return `M ${points.join(' L ')}`;
    };

    return {
      iWavePath: generateWaveformPath(phaseOffset, 45),
      qWavePath: generateWaveformPath(phaseOffset + Math.PI / 2, 45),
    };
  }, [activeSignal.rawIQ, phaseOffset]);

  // ─── 2. Frequency Spectrum (FFT) Paths (Real or Fallback) ───
  const { psdPath, psdFillPath, peakDbText, floorDbText } = useMemo(() => {
    const width = 320;
    const height = 160;

    if (activeSignal.psdSpectrum && activeSignal.psdSpectrum.length > 10) {
      const psd = activeSignal.psdSpectrum;
      let minP = Infinity;
      let maxP = -Infinity;
      for (let i = 0; i < psd.length; i++) {
        if (psd[i] < minP) minP = psd[i];
        if (psd[i] > maxP) maxP = psd[i];
      }
      if (maxP - minP < 1) maxP = minP + 10;

      const numPoints = Math.min(160, psd.length);
      const stride = psd.length / numPoints;
      const points: string[] = [];

      for (let i = 0; i < numPoints; i++) {
        const binIdx = Math.min(Math.floor(i * stride), psd.length - 1);
        const x = (i / (numPoints - 1)) * width;
        // Normalize: peak at y=20, floor at y=148
        const norm = (psd[binIdx] - minP) / (maxP - minP);
        const y = 148 - norm * 128;
        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }

      const strokePath = `M ${points.join(' L ')}`;
      const fillPath = `${strokePath} L ${width} ${height} L 0 ${height} Z`;

      return {
        psdPath: strokePath,
        psdFillPath: fillPath,
        peakDbText: `${maxP.toFixed(1)} dBm Peak`,
        floorDbText: `${minP.toFixed(1)} dBm Floor`,
      };
    }

    // Default static fallback
    return {
      psdPath: 'M 0 148 L 40 145 L 80 142 L 105 138 L 120 120 L 135 60 L 150 26 L 160 18 L 170 28 L 185 64 L 200 122 L 215 139 L 240 143 L 280 146 L 320 148',
      psdFillPath: 'M 0 148 L 40 145 L 80 142 L 105 138 L 120 120 L 135 60 L 150 26 L 160 18 L 170 28 L 185 64 L 200 122 L 215 139 L 240 143 L 280 146 L 320 148 L 320 160 L 0 160 Z',
      peakDbText: '-12 dBm Peak',
      floorDbText: '-80 dBm Floor',
    };
  }, [activeSignal.psdSpectrum]);

  // ─── 3. Spectrogram Waterfall Canvas Rendering ───
  useEffect(() => {
    if (!canvasRef.current || !activeSignal.spectrogramData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgPixels = spectrogramToRGBA(activeSignal.spectrogramData, 320, 160);
    const imgData = new ImageData(imgPixels, 320, 160);
    ctx.putImageData(imgData, 0, 0);
  }, [activeSignal.spectrogramData]);

  // ─── 4. IQ Constellation Points (Real or Fallback) ───
  const constellationPoints = useMemo(() => {
    if (activeSignal.demodulationResult?.constellation && activeSignal.demodulationResult.constellation.length > 0) {
      const rawPoints = activeSignal.demodulationResult.constellation.slice(0, 200);
      let maxAbs = 0.1;
      for (const pt of rawPoints) {
        maxAbs = Math.max(maxAbs, Math.abs(pt.i), Math.abs(pt.q));
      }

      return rawPoints.map((pt, idx) => ({
        cx: 80 + (pt.i / maxAbs) * 55,
        cy: 80 - (pt.q / maxAbs) * 55,
        r: 1.5,
        key: idx,
      }));
    }
    return null;
  }, [activeSignal.demodulationResult]);

  return (
    <section
      id="signal-visualization-section"
      className="flex flex-col gap-2.5 bg-[#171b26] p-4 rounded shadow-md border border-[#262a35]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-[#4cd7f6] w-4 h-4" />
          <h2 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-[#dfe2f1]">
            Signal Visualization — Multi-Domain Quadrant Visualizer
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {activeSignal.isComputed && (
            <span className="font-mono text-[10px] text-[#4cd7f6] bg-[#003640] px-2 py-0.5 rounded border border-[#4cd7f6]/40 font-bold uppercase tracking-wider">
              REAL DSP PIPELINE ACTIVE
            </span>
          )}
          <span className="font-mono text-[10px] text-[#869397] uppercase">Display Rate:</span>
          <span className="font-mono text-[11px] text-[#4edea3] bg-[#0a0e18] px-2 py-0.5 rounded border border-[#4edea3]/20 font-bold">
            60 FPS REALTIME
          </span>
        </div>
      </div>

      {/* 4-Grid Quad Screen */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
        {/* Visualizer 1: Time Domain / Waveform */}
        <div className="flex flex-col bg-[#0a0e18] rounded p-2.5 shadow-sm border border-[#262a35]">
          <div className="flex items-center justify-between pb-1">
            <span className="font-mono text-[10px] text-[#dfe2f1] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]"></span>
              Time Domain (I / Q)
            </span>
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <span className="text-[#4cd7f6] font-bold">I</span>
              <span className="text-[#869397]">/</span>
              <span className="text-[#adc6ff] font-bold">Q</span>
            </div>
          </div>

          {/* Waveform SVG */}
          <div className="relative w-full h-44 bg-[#262a35]/30 rounded overflow-hidden flex items-center justify-center border border-[#171b26]">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 320 160">
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="320" y2="40" stroke="#171b26" strokeDasharray="2 2" strokeWidth="1" />
              <line x1="0" y1="80" x2="320" y2="80" stroke="#313540" strokeWidth="1" />
              <line x1="0" y1="120" x2="320" y2="120" stroke="#171b26" strokeDasharray="2 2" strokeWidth="1" />
              <line x1="80" y1="0" x2="80" y2="160" stroke="#171b26" strokeDasharray="2 2" strokeWidth="1" />
              <line x1="160" y1="0" x2="160" y2="160" stroke="#171b26" strokeDasharray="2 2" strokeWidth="1" />
              <line x1="240" y1="0" x2="240" y2="160" stroke="#171b26" strokeDasharray="2 2" strokeWidth="1" />

              {/* Dynamic In-Phase (I) Wave */}
              <path d={iWavePath} fill="none" stroke="#4cd7f6" strokeWidth="1.8" opacity="0.95" />

              {/* Quadrature Q (Indigo/Secondary) */}
              <path
                d={qWavePath}
                fill="none"
                stroke="#adc6ff"
                strokeWidth="1.8"
                strokeDasharray="4 2"
                opacity="0.85"
              />
            </svg>

            {/* Coordinate Badges */}
            <span className="absolute top-1 left-2 font-mono text-[9px] text-[#869397]">+1.0V</span>
            <span className="absolute bottom-1 left-2 font-mono text-[9px] text-[#869397]">-1.0V</span>
            <span className="absolute bottom-1 right-2 font-mono text-[9px] text-[#4cd7f6]">
              T: {activeSignal.durFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1.5 text-[#869397] font-mono text-[11px]">
            <span>Samples: {activeSignal.rawIQ ? `${(activeSignal.rawIQ.length >> 1).toLocaleString()} pts` : 'Live Buffer'}</span>
            <span>Phase: 45°/135°</span>
          </div>
        </div>

        {/* Visualizer 2: Frequency Spectrum (FFT) */}
        <div className="flex flex-col bg-[#0a0e18] rounded p-2.5 shadow-sm border border-[#262a35]">
          <div className="flex items-center justify-between pb-1">
            <span className="font-mono text-[10px] text-[#dfe2f1] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]"></span>
              Frequency Spectrum (FFT)
            </span>
            <span className="font-mono text-[11px] text-[#4cd7f6] font-medium">
              Fc: {activeSignal.fcFormatted}
            </span>
          </div>

          {/* Spectrum SVG */}
          <div className="relative w-full h-44 bg-[#262a35]/30 rounded overflow-hidden flex items-center justify-center border border-[#171b26]">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 320 160">
              <defs>
                <linearGradient id="spectrumGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.65" />
                  <stop offset="80%" stopColor="#0566d9" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0f131d" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="320" y2="40" stroke="#171b26" strokeWidth="1" />
              <line x1="0" y1="80" x2="320" y2="80" stroke="#171b26" strokeWidth="1" />
              <line x1="0" y1="120" x2="320" y2="120" stroke="#171b26" strokeWidth="1" />
              <line x1="160" y1="0" x2="160" y2="160" stroke="#06b6d4" strokeDasharray="3 3" strokeWidth="1" />

              {/* Bandwidth markers */}
              <rect x="110" y="20" width="100" height="135" fill="rgba(6,182,212,0.08)" />
              <line x1="110" y1="20" x2="110" y2="160" stroke="#06b6d4" strokeDasharray="2 2" strokeWidth="1" opacity="0.6" />
              <line x1="210" y1="20" x2="210" y2="160" stroke="#06b6d4" strokeDasharray="2 2" strokeWidth="1" opacity="0.6" />

              {/* Dynamic or Real PSD Curve */}
              <path d={psdFillPath} fill="url(#spectrumGradient)" />
              <path d={psdPath} fill="none" stroke="#4cd7f6" strokeWidth="1.8" />
            </svg>

            <span className="absolute top-1 left-2 font-mono text-[9px] text-[#4edea3] font-bold">
              {peakDbText}
            </span>
            <span className="absolute bottom-1 left-2 font-mono text-[9px] text-[#869397]">
              {floorDbText}
            </span>
            <span className="absolute top-1 right-2 font-mono text-[9px] text-[#4cd7f6]">
              BW: {activeSignal.telemetry.bandwidthMHz.toFixed(2)} MHz
            </span>
          </div>

          <div className="flex items-center justify-between pt-1.5 text-[#869397] font-mono text-[11px]">
            <span>Span: 5.0 MHz</span>
            <span>RBW: 10 kHz</span>
          </div>
        </div>

        {/* Visualizer 3: Waterfall / Spectrogram */}
        <div className="flex flex-col bg-[#0a0e18] rounded p-2.5 shadow-sm border border-[#262a35]">
          <div className="flex items-center justify-between pb-1">
            <span className="font-mono text-[10px] text-[#dfe2f1] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
              Waterfall Spectrogram
            </span>
            <span className="font-mono text-[10px] text-[#4edea3] font-bold">TIME v. FREQ</span>
          </div>

          {/* Spectrogram Canvas or SVG Fallback */}
          <div className="relative w-full h-44 bg-[#262a35]/40 rounded overflow-hidden flex flex-col justify-between border border-[#171b26]">
            {activeSignal.spectrogramData ? (
              <canvas
                ref={canvasRef}
                width={320}
                height={160}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 320 160">
                <defs>
                  <linearGradient id="waterfallGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0a0e18" />
                    <stop offset="35%" stopColor="#171b26" />
                    <stop offset="45%" stopColor="#0566d9" />
                    <stop offset="50%" stopColor="#4cd7f6" />
                    <stop offset="55%" stopColor="#4edea3" />
                    <stop offset="65%" stopColor="#0566d9" />
                    <stop offset="75%" stopColor="#171b26" />
                    <stop offset="100%" stopColor="#0a0e18" />
                  </linearGradient>
                </defs>

                {/* Base Gradient Backing */}
                <rect x="0" y="0" width="320" height="160" fill="url(#waterfallGrad)" opacity="0.85" />

                {/* Cascading Bursts simulating continuous RF capture */}
                <rect x="135" y="10" width="50" height="18" fill="#4edea3" opacity="0.75" />
                <rect x="140" y="32" width="40" height="14" fill="#4cd7f6" opacity="0.85" />
                <rect x="138" y="50" width="44" height="20" fill="#4edea3" opacity="0.8" />
                <rect x="136" y="74" width="48" height="16" fill="#4cd7f6" opacity="0.9" />
                <rect x="142" y="94" width="36" height="18" fill="#4edea3" opacity="0.7" />
                <rect x="139" y="116" width="42" height="22" fill="#4cd7f6" opacity="0.85" />
                <rect x="137" y="142" width="46" height="14" fill="#4edea3" opacity="0.9" />

                {/* Time Horizontal Ticks */}
                <line x1="0" y1="40" x2="320" y2="40" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="0" y1="80" x2="320" y2="80" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="0" y1="120" x2="320" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              </svg>
            )}

            <span className="absolute top-1 left-2 font-mono text-[9px] text-[#4cd7f6]">T: -0.0s</span>
            <span className="absolute bottom-1 left-2 font-mono text-[9px] text-[#869397]">
              T: -{activeSignal.durFormatted}
            </span>
            <span className="absolute bottom-1 right-2 font-mono text-[9px] text-[#4edea3] font-semibold">
              BURST ACTIVE
            </span>
          </div>

          <div className="flex items-center justify-between pt-1.5 text-[#869397] font-mono text-[11px]">
            <span>Heatmap: Power (dB)</span>
            <span>FFT Size: 2048</span>
          </div>
        </div>

        {/* Visualizer 4: Constellation Diagram */}
        <div className="flex flex-col bg-[#0a0e18] rounded p-2.5 shadow-sm border border-[#262a35]">
          <div className="flex items-center justify-between pb-1">
            <span className="font-mono text-[10px] text-[#dfe2f1] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]"></span>
              IQ Constellation ({activeSignal.constellationType})
            </span>
            <span className="font-mono text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-1.5 rounded font-bold">
              EVM: {activeSignal.evmRms.toFixed(1)}% RMS
            </span>
          </div>

          {/* Constellation SVG */}
          <div className="relative w-full h-44 bg-[#262a35]/30 rounded overflow-hidden flex items-center justify-center border border-[#171b26]">
            <svg className="w-full h-full" viewBox="0 0 160 160">
              {/* Crosshairs */}
              <line x1="80" y1="10" x2="80" y2="150" stroke="#313540" strokeWidth="1" />
              <line x1="10" y1="80" x2="150" y2="80" stroke="#313540" strokeWidth="1" />
              <circle cx="80" cy="80" r="50" fill="none" stroke="#171b26" strokeDasharray="2 2" strokeWidth="1" />

              {/* Quadrant Reference Centers */}
              <circle cx="45" cy="45" r="3" fill="none" stroke="#869397" strokeDasharray="1 1" strokeWidth="1" />
              <circle cx="115" cy="45" r="3" fill="none" stroke="#869397" strokeDasharray="1 1" strokeWidth="1" />
              <circle cx="45" cy="115" r="3" fill="none" stroke="#869397" strokeDasharray="1 1" strokeWidth="1" />
              <circle cx="115" cy="115" r="3" fill="none" stroke="#869397" strokeDasharray="1 1" strokeWidth="1" />

              {/* Real Constellation points if computed */}
              {constellationPoints ? (
                <g fill="#4cd7f6" opacity="0.85">
                  {constellationPoints.map((pt) => (
                    <circle key={pt.key} cx={pt.cx} cy={pt.cy} r={pt.r} />
                  ))}
                </g>
              ) : (
                /* Clustered scatter points Quad 1-4 fallback */
                <>
                  <g fill="#4cd7f6" opacity="0.85">
                    <circle cx="114" cy="46" r="1.8" />
                    <circle cx="117" cy="43" r="1.5" />
                    <circle cx="112" cy="48" r="1.3" />
                    <circle cx="115" cy="44" r="2.0" />
                    <circle cx="119" cy="47" r="1.4" />
                    <circle cx="113" cy="42" r="1.6" />
                    <circle cx="116" cy="49" r="1.2" />
                  </g>
                  <g fill="#4cd7f6" opacity="0.85">
                    <circle cx="44" cy="45" r="1.8" />
                    <circle cx="47" cy="42" r="1.5" />
                    <circle cx="42" cy="48" r="1.3" />
                    <circle cx="46" cy="46" r="2.0" />
                    <circle cx="41" cy="43" r="1.4" />
                    <circle cx="48" cy="47" r="1.6" />
                  </g>
                  <g fill="#4cd7f6" opacity="0.85">
                    <circle cx="46" cy="114" r="1.8" />
                    <circle cx="43" cy="117" r="1.5" />
                    <circle cx="48" cy="112" r="1.3" />
                    <circle cx="44" cy="115" r="2.0" />
                    <circle cx="42" cy="118" r="1.4" />
                    <circle cx="47" cy="113" r="1.6" />
                  </g>
                  <g fill="#4cd7f6" opacity="0.85">
                    <circle cx="115" cy="114" r="1.8" />
                    <circle cx="112" cy="117" r="1.5" />
                    <circle cx="118" cy="112" r="1.3" />
                    <circle cx="116" cy="115" r="2.0" />
                    <circle cx="113" cy="118" r="1.4" />
                    <circle cx="117" cy="113" r="1.6" />
                  </g>
                </>
              )}
            </svg>

            <span className="absolute top-1 right-2 font-mono text-[9px] text-[#869397]">Q: Imag</span>
            <span className="absolute bottom-1 right-2 font-mono text-[9px] text-[#869397]">I: Real</span>
            <span className="absolute bottom-1 left-2 font-mono text-[9px] text-[#4edea3]">
              SNR: {activeSignal.telemetry.estimatedSnrDb.toFixed(1)}dB
            </span>
          </div>

          <div className="flex items-center justify-between pt-1.5 text-[#869397] font-mono text-[11px]">
            <span>Points: {constellationPoints ? `${constellationPoints.length} Syms` : '2048 Syms'}</span>
            <span>Phase Jitter: ±{activeSignal.phaseJitterDeg.toFixed(1)}°</span>
          </div>
        </div>
      </div>
    </section>
  );
};
