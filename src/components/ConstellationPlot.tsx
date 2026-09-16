/**
 * SignalLens AI — I/Q Constellation Plot (PRD 4.7)
 *
 * Standalone canvas-based scatter plot of demodulated I/Q symbols.
 * Color-maps each quadrant (QPSK/PSK convention), draws decision boundaries,
 * and annotates EVM/SNR as overlays.
 *
 * Works with real DemodulationResult constellation data or a synthetic
 * fallback for sample data display.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import type { SignalProfile } from '../types';
import type { ConstellationPoint } from '../lib/dsp/demodulator';

interface ConstellationPlotProps {
  activeSignal: SignalProfile;
  width?: number;
  height?: number;
  className?: string;
}

// ─── Synthetic Constellation Generator ──────────────────────────────────────

function syntheticConstellation(
  type: string,
  evmPct: number,
  count: number = 800
): ConstellationPoint[] {
  const points: ConstellationPoint[] = [];
  const noise = evmPct / 100;
  const rng = (seed: number) => {
    let s = seed;
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s / 0x7fffffff - 0.5) * 2;
  };

  const idealPoints = getIdealPoints(type);
  for (let i = 0; i < count; i++) {
    const ideal = idealPoints[i % idealPoints.length];
    points.push({
      i: ideal.i + rng(i * 7919) * noise,
      q: ideal.q + rng(i * 6271 + 1) * noise,
    });
  }
  return points;
}

function getIdealPoints(type: string): ConstellationPoint[] {
  switch (type) {
    case 'BPSK':
      return [{ i: 1, q: 0 }, { i: -1, q: 0 }];
    case '16-QAM':
      const pts: ConstellationPoint[] = [];
      for (const i of [-3, -1, 1, 3]) {
        for (const q of [-3, -1, 1, 3]) {
          pts.push({ i: i / 3, q: q / 3 });
        }
      }
      return pts;
    case 'FSK':
      return [
        { i: 0.8, q: 0 }, { i: -0.8, q: 0 },
        { i: 0, q: 0.6 }, { i: 0, q: -0.6 },
      ];
    case 'QPSK':
    default:
      return [
        { i: 0.707, q: 0.707 },
        { i: -0.707, q: 0.707 },
        { i: -0.707, q: -0.707 },
        { i: 0.707, q: -0.707 },
      ];
  }
}

// ─── Quadrant color for a given (I, Q) ─────────────────────────────────────

function quadrantColor(x: number, y: number, alpha: number): string {
  if (x >= 0 && y >= 0) return `rgba(78, 222, 163, ${alpha})`;   // Q1 cyan-green
  if (x < 0 && y >= 0) return `rgba(76, 215, 246, ${alpha})`;    // Q2 cyan
  if (x < 0 && y < 0) return `rgba(170, 100, 255, ${alpha})`;    // Q3 purple
  return `rgba(255, 170, 60, ${alpha})`;                           // Q4 amber
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ConstellationPlot: React.FC<ConstellationPlotProps> = ({
  activeSignal,
  width = 400,
  height = 400,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // ── Background ────────────────────────────────────────────────
    ctx.fillStyle = '#0a0e18';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(38, 42, 53, 0.9)';
    ctx.lineWidth = 0.5;
    const gridDivisions = 8;
    for (let g = 0; g <= gridDivisions; g++) {
      const x = (g / gridDivisions) * W;
      const y = (g / gridDivisions) * H;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(76, 215, 246, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    ctx.setLineDash([]);

    // Unit circle
    ctx.strokeStyle = 'rgba(76, 215, 246, 0.12)';
    ctx.lineWidth = 1;
    const scale = Math.min(W, H) * 0.38;
    const cx = W / 2;
    const cy = H / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, scale, 0, Math.PI * 2);
    ctx.stroke();

    // ── Gather constellation points ────────────────────────────────
    let points: ConstellationPoint[];
    if (activeSignal.demodulationResult?.constellation?.length) {
      points = activeSignal.demodulationResult.constellation.slice(0, 2000);
    } else {
      points = syntheticConstellation(
        activeSignal.constellationType,
        activeSignal.evmRms,
        600
      );
    }

    // Compute range for normalization
    let maxAmp = 0;
    for (const p of points) {
      const amp = Math.sqrt(p.i * p.i + p.q * p.q);
      if (amp > maxAmp) maxAmp = amp;
    }
    const normScale = maxAmp > 0 ? scale / (maxAmp * 1.15) : scale;

    // ── Draw ideal decision boundaries (dashed) ───────────────────
    if (activeSignal.constellationType === 'QPSK' || activeSignal.constellationType === 'BPSK') {
      const idealPts = getIdealPoints(activeSignal.constellationType);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      for (const p of idealPts) {
        const px = cx + p.i * normScale;
        const py = cy - p.q * normScale;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Draw points ───────────────────────────────────────────────
    const ptRadius = Math.max(1.5, Math.min(3, 2000 / points.length));
    for (const p of points) {
      const px = cx + p.i * normScale;
      const py = cy - p.q * normScale;

      if (px < 0 || px > W || py < 0 || py > H) continue;

      const alpha = activeSignal.demodulationResult ? 0.7 : 0.65;
      ctx.fillStyle = quadrantColor(p.i, p.q, alpha);
      ctx.beginPath();
      ctx.arc(px, py, ptRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Axis labels ───────────────────────────────────────────────
    ctx.fillStyle = 'rgba(134, 147, 151, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('I', W - 14, H / 2 - 6);
    ctx.textAlign = 'left';
    ctx.fillText('Q', cx + 6, 14);

    // ── Stats overlay ─────────────────────────────────────────────
    const isReal = !!activeSignal.demodulationResult;
    const evmLabel = `EVM: ${activeSignal.evmRms.toFixed(1)}%`;
    const snrLabel = `SNR: +${activeSignal.telemetry.estimatedSnrDb.toFixed(1)} dB`;
    const modLabel = activeSignal.telemetry.modulation;
    const srcLabel = isReal ? 'LIVE DSP' : 'SYNTHETIC';

    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = isReal ? 'rgba(78, 222, 163, 0.9)' : 'rgba(255, 170, 60, 0.7)';
    ctx.fillText(`● ${srcLabel}`, 10, 20);

    ctx.fillStyle = 'rgba(76, 215, 246, 0.85)';
    ctx.font = '10px monospace';
    ctx.fillText(modLabel, 10, 36);
    ctx.fillStyle = 'rgba(200, 210, 220, 0.7)';
    ctx.fillText(evmLabel, 10, 50);
    ctx.fillText(snrLabel, 10, 64);

    ctx.fillStyle = 'rgba(100, 110, 120, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText(`${points.length} symbols`, W - 10, H - 10);
  }, [activeSignal]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`block ${className}`}
      aria-label={`I/Q Constellation plot for ${activeSignal.telemetry.modulation}`}
    />
  );
};
