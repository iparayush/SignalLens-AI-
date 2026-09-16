/**
 * SignalLens AI — Waterfall / Time-Frequency Panel (PRD 4.8)
 *
 * Full-width scrollable waterfall display independent of confidence gating.
 * Renders the STFT spectrogram using the cyan-green tactical colormap
 * from spectrogram.ts, with frequency axis, time axis, and power scale.
 *
 * Uses OffscreenCanvas for the pixel rendering path; falls back to an
 * animated synthetic waterfall for sample/demo signals.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { spectrogramToRGBA } from '../lib/dsp/spectrogram';
import { computeSpectrogram } from '../lib/dsp/spectrogram';
import type { SignalProfile } from '../types';

interface WaterfallPanelProps {
  activeSignal: SignalProfile;
  /** Height of the waterfall canvas in pixels */
  waterfallHeight?: number;
  className?: string;
}

// ─── Synthetic Waterfall Generator ──────────────────────────────────────────

function generateSyntheticWaterfall(
  width: number,
  height: number,
  centerBin: number,
  bandwidthBins: number,
  timeOffset: number
): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(width * height * 4);

  for (let py = 0; py < height; py++) {
    const time = (py / height + timeOffset * 0.001) % 1;
    for (let px = 0; px < width; px++) {
      const freq = px / width;
      const dist = Math.abs((px - centerBin) / (bandwidthBins * 0.5));
      const signal = Math.max(0, 1 - dist * dist * 2) * 0.85;
      const noise = Math.random() * 0.08;
      const fade = Math.sin(time * Math.PI * 4 + freq * 6) * 0.04;
      const norm = Math.max(0, Math.min(1, signal + noise + fade));

      // Same colormap logic as spectrogramToRGBA
      let r: number, g: number, b: number;
      if (norm < 0.25) {
        const t = norm / 0.25;
        r = 10 + t * 5; g = 14 + t * 13; b = 24 + t * 40;
      } else if (norm < 0.5) {
        const t = (norm - 0.25) / 0.25;
        r = 15 + t * 60; g = 27 + t * 155; b = 64 + t * 142;
      } else if (norm < 0.75) {
        const t = (norm - 0.5) / 0.25;
        r = 75 + t * 3; g = 182 + t * 40; b = 206 - t * 40;
      } else {
        const t = (norm - 0.75) / 0.25;
        r = 78 + t * 177; g = 222 + t * 33; b = 166 - t * 20;
      }

      const idx = (py * width + px) * 4;
      pixels[idx] = Math.floor(r);
      pixels[idx + 1] = Math.floor(g);
      pixels[idx + 2] = Math.floor(b);
      pixels[idx + 3] = 255;
    }
  }
  return pixels;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const WaterfallPanel: React.FC<WaterfallPanelProps> = ({
  activeSignal,
  waterfallHeight = 260,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeOffsetRef = useRef<number>(0);
  const isSynthetic = !activeSignal.spectrogramData;

  const drawReal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeSignal.spectrogramData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = waterfallHeight;

    const pixels = spectrogramToRGBA(activeSignal.spectrogramData, W, H);
    const imageData = new ImageData(pixels, W, H);
    ctx.putImageData(imageData, 0, 0);
  }, [activeSignal.spectrogramData, waterfallHeight]);

  const drawSynthetic = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = waterfallHeight;
    const centerBin = Math.round(W * 0.5);
    const bandBins = Math.round(W * 0.35 * (activeSignal.telemetry.bandwidthMHz / (activeSignal.telemetry.samplingFreqMHz || 1)));

    const pixels = generateSyntheticWaterfall(
      W, H,
      centerBin,
      Math.max(40, Math.min(W * 0.8, bandBins)),
      timeOffsetRef.current
    );
    const imageData = new ImageData(pixels, W, H);
    ctx.putImageData(imageData, 0, 0);

    timeOffsetRef.current += 1;
    animFrameRef.current = requestAnimationFrame(drawSynthetic);
  }, [activeSignal.telemetry, waterfallHeight]);

  useEffect(() => {
    cancelAnimationFrame(animFrameRef.current);

    if (isSynthetic) {
      animFrameRef.current = requestAnimationFrame(drawSynthetic);
    } else {
      drawReal();
    }

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isSynthetic, drawReal, drawSynthetic]);

  // Resize canvas when container changes
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const newW = container.clientWidth;
      if (newW > 0 && canvas.width !== newW) {
        canvas.width = newW;
        if (!isSynthetic) drawReal();
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [isSynthetic, drawReal]);

  const fsHz = (activeSignal.telemetry.samplingFreqMHz || 1) * 1e6;
  const fcHz = (activeSignal.centerCarrierMHz || 0) * 1e6;
  const freqMin = (fcHz - fsHz / 2) / 1e6;
  const freqMax = (fcHz + fsHz / 2) / 1e6;

  return (
    <div className={`relative ${className}`} style={{ width: '100%' }}>
      {/* Frequency axis */}
      <div className="flex justify-between px-2 mb-0.5">
        <span className="font-mono text-[10px] text-[#869397]">
          {freqMin.toFixed(3)} MHz
        </span>
        <span className="font-mono text-[10px] text-[#4cd7f6] font-bold">
          Fc {fcHz > 0 ? `${(fcHz / 1e6).toFixed(3)} MHz` : '(offset)'}
        </span>
        <span className="font-mono text-[10px] text-[#869397]">
          {freqMax.toFixed(3)} MHz
        </span>
      </div>

      {/* Waterfall canvas */}
      <div ref={containerRef} className="relative overflow-hidden rounded border border-[#1e2330]" style={{ height: waterfallHeight }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={waterfallHeight}
          className="block w-full"
          style={{ imageRendering: 'pixelated' }}
          aria-label="Waterfall spectrogram display"
        />

        {/* Source badge */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold border backdrop-blur-sm ${
          isSynthetic
            ? 'bg-amber-900/40 border-amber-700/50 text-amber-300'
            : 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300'
        }`}>
          {isSynthetic ? '◉ SYNTHETIC' : '◉ LIVE STFT'}
        </div>

        {/* Power scale bar */}
        <div className="absolute left-2 top-2 flex flex-col gap-0.5" aria-label="Power scale">
          {activeSignal.spectrogramData && (
            <>
              <span className="font-mono text-[9px] text-white/50">
                {activeSignal.spectrogramData.maxPowerDb.toFixed(0)} dB
              </span>
              <div
                className="w-2 rounded"
                style={{
                  height: waterfallHeight - 24,
                  background: 'linear-gradient(to bottom, rgb(255,248,165), rgb(78,222,163), rgb(76,175,246), rgb(10,14,24))',
                }}
              />
              <span className="font-mono text-[9px] text-white/50">
                {activeSignal.spectrogramData.minPowerDb.toFixed(0)} dB
              </span>
            </>
          )}
        </div>
      </div>

      {/* Time axis */}
      <div className="flex justify-between px-2 mt-0.5">
        <span className="font-mono text-[10px] text-[#869397]">t = 0 s</span>
        <span className="font-mono text-[10px] text-[#869397]">
          t = {activeSignal.durationSeconds.toFixed(2)} s
        </span>
      </div>

      {isSynthetic && (
        <p className="font-mono text-[10px] text-amber-400/60 mt-1 text-center">
          Synthetic animation — upload a real .IQ/.wav file for computed STFT
        </p>
      )}
    </div>
  );
};
