import React, { useEffect, useRef, useState } from 'react';
import { ProcessingState } from '../types';
import { Activity, Radio, Play, Pause, RefreshCw, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

interface LiveTimeDomainScopeProps {
  processingState?: ProcessingState; // 'idle' | 'processing' | 'complete' | 'error'
  rawIQ?: Float32Array;
  sampleRate?: number;
  modulation?: string;
  snrDb?: number;
  evmPct?: number;
  title?: string;
  subtitle?: string;
  height?: number;
}

export const LiveTimeDomainScope: React.FC<LiveTimeDomainScopeProps> = ({
  processingState = 'complete',
  rawIQ,
  sampleRate = 2400000,
  modulation = 'QPSK',
  snrDb = 22.4,
  evmPct = 4.2,
  title = 'Time Domain Scope (I / Q Stream)',
  subtitle,
  height = 240,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [channelMode, setChannelMode] = useState<'both' | 'i-only' | 'q-only'>('both');
  const [gain, setGain] = useState<number>(1.0);

  // Animation frame loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;
    let lastTime = performance.now();

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isRunning) {
        // Increment offset to create right-to-left flowing signal
        offset += dt * (processingState === 'processing' ? 360 : 180);
      }

      const w = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      // Reset transform and clear
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.scale(dpr, dpr);

      const displayW = rect.width;
      const displayH = rect.height;
      const displayMidY = displayH / 2;

      // ─── 1. Background Grid (Radar Scope HUD) ───
      ctx.fillStyle = '#080d19';
      ctx.fillRect(0, 0, displayW, displayH);

      // Grid division lines
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(76, 215, 246, 0.08)';

      const numCols = 10;
      for (let c = 1; c < numCols; c++) {
        const x = (c / numCols) * displayW;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, displayH);
        ctx.stroke();
      }

      const numRows = 8;
      for (let r = 1; r < numRows; r++) {
        const y = (r / numRows) * displayH;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(displayW, y);
        ctx.stroke();
      }

      // Center crosshair line
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(76, 215, 246, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, displayMidY);
      ctx.lineTo(displayW, displayMidY);
      ctx.stroke();
      ctx.setLineDash([]);

      // ─── 2. State-Based Signal Waveforms ───
      if (processingState === 'idle') {
        // Idle state: subtle flat baseline with light noise
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(134, 147, 151, 0.4)';
        ctx.beginPath();
        for (let x = 0; x < displayW; x += 3) {
          const noise = (Math.random() - 0.5) * 2;
          const y = displayMidY + noise;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Idle overlay badge
        ctx.fillStyle = 'rgba(134, 147, 151, 0.7)';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('STANDBY // AWAITING IQ / WAV STREAM', displayW / 2, displayMidY - 14);
      } else {
        // Animated Right-to-Left Waveforms (Processing or Live Complete Monitor)
        const numPoints = Math.floor(displayW);
        const iPoints: number[] = new Array(numPoints);
        const qPoints: number[] = new Array(numPoints);

        const hasRealIQ = rawIQ && rawIQ.length >= 256;
        const speedMultiplier = processingState === 'processing' ? 1.6 : 0.8;
        const phaseShift = (offset * 0.05 * speedMultiplier) % (Math.PI * 2);

        for (let x = 0; x < numPoints; x++) {
          let iVal = 0;
          let qVal = 0;

          if (hasRealIQ && processingState === 'complete') {
            // Sample real I/Q with scrolling window
            const sampleIdx = Math.floor((x * 2 + Math.floor(offset * 4)) % (rawIQ.length - 2));
            iVal = rawIQ[sampleIdx] * gain;
            qVal = rawIQ[sampleIdx + 1] * gain;
          } else {
            // Synthesized dynamic multi-frequency carrier with symbol transitions
            const t = (x / displayW) * 8 * Math.PI + phaseShift;
            const envelope = 0.7 + 0.3 * Math.sin(t * 0.25);
            const noise = (Math.random() - 0.5) * (processingState === 'processing' ? 0.15 : 0.05);

            // In-Phase
            iVal = (Math.sin(t * 1.5) * 0.7 + Math.cos(t * 0.5) * 0.3) * envelope * gain + noise;
            // Quadrature (orthogonal 90° phase shift + carrier harmonics)
            qVal = (Math.cos(t * 1.5) * 0.7 - Math.sin(t * 0.5) * 0.3) * envelope * gain + noise;
          }

          const ampScale = (displayH * 0.38);
          iPoints[x] = displayMidY - Math.max(-1.1, Math.min(1.1, iVal)) * ampScale;
          qPoints[x] = displayMidY - Math.max(-1.1, Math.min(1.1, qVal)) * ampScale;
        }

        // Draw In-Phase (I) Waveform — Electric Cyan
        if (channelMode === 'both' || channelMode === 'i-only') {
          ctx.save();
          ctx.lineWidth = processingState === 'processing' ? 2.2 : 1.8;
          ctx.strokeStyle = '#00f2fe';
          ctx.shadowColor = '#00f2fe';
          ctx.shadowBlur = processingState === 'processing' ? 10 : 5;

          ctx.beginPath();
          for (let x = 0; x < numPoints; x++) {
            if (x === 0) ctx.moveTo(x, iPoints[x]);
            else ctx.lineTo(x, iPoints[x]);
          }
          ctx.stroke();
          ctx.restore();
        }

        // Draw Quadrature (Q) Waveform — Neon Purple / Amber
        if (channelMode === 'both' || channelMode === 'q-only') {
          ctx.save();
          ctx.lineWidth = processingState === 'processing' ? 1.8 : 1.4;
          ctx.strokeStyle = '#c084fc';
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = processingState === 'processing' ? 8 : 4;

          ctx.beginPath();
          for (let x = 0; x < numPoints; x++) {
            if (x === 0) ctx.moveTo(x, qPoints[x]);
            else ctx.lineTo(x, qPoints[x]);
          }
          ctx.stroke();
          ctx.restore();
        }
      }

      // ─── 3. Scope Axis Labels ───
      ctx.fillStyle = 'rgba(134, 147, 151, 0.7)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('+1.0', 5, 12);
      ctx.fillText(' 0.0', 5, displayMidY - 3);
      ctx.fillText('-1.0', 5, displayH - 6);

      ctx.textAlign = 'right';
      ctx.fillText('10.0 ms', displayW - 6, displayH - 6);
      ctx.textAlign = 'center';
      ctx.fillText('5.0 ms', displayW / 2, displayH - 6);
      ctx.textAlign = 'left';
      ctx.fillText('0.0 ms', 45, displayH - 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, processingState, rawIQ, channelMode, gain]);

  return (
    <div className="flex flex-col bg-[#0b1220] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Scope Header Ribbon */}
      <div className="px-4 py-2.5 bg-[#0e1626] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-headline font-bold text-xs text-white flex items-center gap-2">
              <span>{title}</span>
              {/* Dynamic Status Indicator Pill */}
              {processingState === 'processing' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-[10px] font-mono font-bold text-amber-300 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  PROCESSING SIGNAL...
                </span>
              )}
              {processingState === 'complete' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-mono font-bold text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  LIVE MONITOR ACTIVE
                </span>
              )}
              {processingState === 'idle' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  IDLE
                </span>
              )}
              {processingState === 'error' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-[10px] font-mono font-bold text-rose-300">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  STREAM ERROR
                </span>
              )}
            </div>
            {subtitle && <p className="text-[10px] font-mono text-slate-400">{subtitle}</p>}
          </div>
        </div>

        {/* Channels & Controls */}
        <div className="flex items-center gap-3 text-xs font-mono">
          {/* Signal Stream Channel Legend */}
          <div className="flex items-center gap-2 text-[11px]">
            <button
              onClick={() => setChannelMode(channelMode === 'i-only' ? 'both' : 'i-only')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border transition ${
                channelMode === 'both' || channelMode === 'i-only'
                  ? 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300 font-bold'
                  : 'border-slate-800 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#00f2fe]" />
              <span>I (In-Phase)</span>
            </button>

            <button
              onClick={() => setChannelMode(channelMode === 'q-only' ? 'both' : 'q-only')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border transition ${
                channelMode === 'both' || channelMode === 'q-only'
                  ? 'bg-purple-950/70 border-purple-500/40 text-purple-300 font-bold'
                  : 'border-slate-800 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#c084fc]" />
              <span>Q (Quadrature)</span>
            </button>
          </div>

          {/* Gain selector */}
          <div className="flex items-center bg-[#070b14] px-2 py-0.5 rounded border border-slate-800 text-[10px] text-slate-300">
            <span className="text-slate-500 mr-1">GAIN:</span>
            {[1.0, 1.5, 2.0].map((g) => (
              <button
                key={g}
                onClick={() => setGain(g)}
                className={`px-1 py-0.5 rounded ${gain === g ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                {g}x
              </button>
            ))}
          </div>

          {/* Pause / Play */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition"
            title={isRunning ? 'Pause stream sweep' : 'Resume stream sweep'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Scope Canvas Surface */}
      <div className="relative w-full" style={{ height }}>
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Processing Animated Progress Line along bottom edge */}
        {processingState === 'processing' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00f2fe] via-[#38bdf8] to-[#9333ea] animate-pulse w-full" />
          </div>
        )}
      </div>

      {/* Telemetry Readout Deck below Scope */}
      <div className="px-4 py-2 bg-[#080d19] border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div>
            MOD: <span className="text-cyan-400 font-bold">{modulation}</span>
          </div>
          <div>
            SNR: <span className="text-emerald-400 font-bold">+{snrDb.toFixed(1)} dB</span>
          </div>
          <div>
            EVM RMS: <span className="text-slate-200 font-bold">{evmPct.toFixed(1)}%</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500">SWEEP: 60 FPS CONTINUOUS</span>
          <span className="text-emerald-400 font-bold">● LOCKED</span>
        </div>
      </div>
    </div>
  );
};
