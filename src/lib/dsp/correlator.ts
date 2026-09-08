/**
 * SignalLens AI — Bit Stream Correlator & Pattern Detector
 *
 * Implements:
 *   - Sliding cross-correlation for sync word detection
 *   - Pattern matching against known preambles
 *   - Peak-to-sidelobe ratio (PSR) computation
 *   - Frame boundary and payload identification
 */

export interface CorrelationMatch {
  /** Byte offset in stream where match starts */
  byteOffset: number;
  /** Bit offset in stream */
  bitOffset: number;
  /** Peak-to-sidelobe ratio in dB */
  psrDb: number;
  /** Match confidence (0-100%) */
  confidence: number;
  /** Identified pattern name */
  patternName: string;
  /** Matched hex string */
  matchedHex: string;
}

export interface CorrelationResult {
  /** All detected matches, sorted by confidence */
  matches: CorrelationMatch[];
  /** Cross-correlation waveform for visualization (normalized 0-1) */
  correlationWaveform: Float64Array;
  /** Peak value in the correlation */
  peakValue: number;
  /** Average sidelobe level */
  sidelobeLevel: number;
  /** PSR of the best match */
  bestPsrDb: number;
  /** Estimated frame length (bytes) if periodic matches found */
  estimatedFrameLengthBytes: number | null;
  /** Processing time (ms) */
  processingTimeMs: number;
}

// ─── Known Sync Patterns ─────────────────────────────────────────────────────

export interface SyncPattern {
  name: string;
  hex: string;
  bits: number[];
  type: 'Barker' | 'CCSDS' | 'MPEG' | 'Custom' | 'Sync Word';
  description: string;
}

function hexToBits(hex: string): number[] {
  const clean = hex.replace(/^0x/i, '');
  const bits: number[] = [];
  for (const ch of clean) {
    const nibble = parseInt(ch, 16);
    for (let b = 3; b >= 0; b--) {
      bits.push((nibble >> b) & 1);
    }
  }
  return bits;
}

export const KNOWN_SYNC_PATTERNS: SyncPattern[] = [
  {
    name: 'Barker 13 Sequence',
    hex: '0x1F35',
    bits: hexToBits('1F35'),
    type: 'Barker',
    description: 'Optimal aperiodic autocorrelation. Standard radar & DSSS.',
  },
  {
    name: 'CCSDS Telemetry ASM',
    hex: '0x1ACFFC1D',
    bits: hexToBits('1ACFFC1D'),
    type: 'CCSDS',
    description: 'Consultative Committee for Space Data Systems 32-bit ASM.',
  },
  {
    name: 'Inmarsat Aero Frame Sync',
    hex: '0xEB90',
    bits: hexToBits('EB90'),
    type: 'Sync Word',
    description: 'Satellite L-band framing word.',
  },
  {
    name: 'Barker 11 Sequence',
    hex: '0x0712',
    bits: hexToBits('0712'),
    type: 'Barker',
    description: '802.11 DSSS PHY header and military beacons.',
  },
  {
    name: 'MPEG-2 Transport Sync',
    hex: '0x47',
    bits: hexToBits('47'),
    type: 'MPEG',
    description: 'MPEG-2 Transport Stream sync byte (188-byte packets).',
  },
];

// ─── Byte-to-Bit Conversion ──────────────────────────────────────────────────

function bytesToBits(data: Uint8Array): Uint8Array {
  const bits = new Uint8Array(data.length * 8);
  for (let i = 0; i < data.length; i++) {
    for (let b = 0; b < 8; b++) {
      bits[i * 8 + b] = (data[i] >> (7 - b)) & 1;
    }
  }
  return bits;
}

// ─── Cross-Correlation Engine ────────────────────────────────────────────────

/**
 * Compute sliding cross-correlation between a bitstream and a sync pattern.
 * Returns correlation values at each bit offset.
 */
function slidingCorrelation(
  streamBits: Uint8Array,
  patternBits: number[]
): Float64Array {
  const N = streamBits.length;
  const M = patternBits.length;
  const corrLen = N - M + 1;

  if (corrLen <= 0) return new Float64Array(0);

  const corr = new Float64Array(corrLen);

  // Convert pattern to ±1 for bipolar correlation
  const patBipolar = patternBits.map(b => b ? 1 : -1);

  for (let offset = 0; offset < corrLen; offset++) {
    let sum = 0;
    for (let k = 0; k < M; k++) {
      const streamBipolar = streamBits[offset + k] ? 1 : -1;
      sum += streamBipolar * patBipolar[k];
    }
    corr[offset] = sum / M; // Normalize to [-1, 1]
  }

  return corr;
}

/**
 * Find peaks in the correlation waveform above a threshold.
 */
function findCorrelationPeaks(
  corr: Float64Array,
  threshold: number = 0.7,
  minDistanceBits: number = 8
): { positions: number[]; values: number[] } {
  const positions: number[] = [];
  const values: number[] = [];

  for (let i = 1; i < corr.length - 1; i++) {
    if (corr[i] > threshold && corr[i] > corr[i - 1] && corr[i] >= corr[i + 1]) {
      // Check minimum distance from previous peak
      if (positions.length === 0 || (i - positions[positions.length - 1]) >= minDistanceBits) {
        positions.push(i);
        values.push(corr[i]);
      }
    }
  }

  return { positions, values };
}

// ─── Main Correlation Interface ──────────────────────────────────────────────

/**
 * Run correlation analysis on a byte stream.
 *
 * @param data      — Byte stream to analyze
 * @param pattern   — Sync pattern to search for (hex string e.g. "0xEB90")
 * @param threshold — Detection threshold (0.0 to 1.0, default 0.7)
 */
export function correlateStream(
  data: Uint8Array,
  pattern: string | SyncPattern,
  threshold: number = 0.7
): CorrelationResult {
  const start = performance.now();

  // Resolve pattern
  let patternBits: number[];
  let patternName: string;
  let patternHex: string;

  if (typeof pattern === 'string') {
    patternBits = hexToBits(pattern);
    patternName = `Custom (${pattern})`;
    patternHex = pattern;
  } else {
    patternBits = pattern.bits;
    patternName = pattern.name;
    patternHex = pattern.hex;
  }

  // Convert stream to bits
  const streamBits = bytesToBits(data);

  // Compute correlation
  const corr = slidingCorrelation(streamBits, patternBits);

  if (corr.length === 0) {
    return {
      matches: [],
      correlationWaveform: new Float64Array(0),
      peakValue: 0,
      sidelobeLevel: 0,
      bestPsrDb: 0,
      estimatedFrameLengthBytes: null,
      processingTimeMs: performance.now() - start,
    };
  }

  // Find peaks
  const { positions, values } = findCorrelationPeaks(corr, threshold, patternBits.length);

  // Compute sidelobe level (average of non-peak correlation)
  let sidelobeSum = 0;
  let sidelobeCount = 0;
  const peakSet = new Set(positions);
  for (let i = 0; i < corr.length; i++) {
    // Skip points within ±pattern_length of any peak
    let nearPeak = false;
    for (const p of positions) {
      if (Math.abs(i - p) < patternBits.length) { nearPeak = true; break; }
    }
    if (!nearPeak) {
      sidelobeSum += Math.abs(corr[i]);
      sidelobeCount++;
    }
  }
  const avgSidelobe = sidelobeCount > 0 ? sidelobeSum / sidelobeCount : 0.01;

  // Build matches
  const matches: CorrelationMatch[] = positions.map((pos, idx) => {
    const peakVal = values[idx];
    const psrDb = 20 * Math.log10(Math.max(peakVal, 1e-10) / Math.max(avgSidelobe, 1e-10));
    const confidence = Math.min(99.9, peakVal * 100);
    const byteOffset = Math.floor(pos / 8);

    return {
      byteOffset,
      bitOffset: pos,
      psrDb: Math.round(psrDb * 10) / 10,
      confidence: Math.round(confidence * 10) / 10,
      patternName,
      matchedHex: patternHex,
    };
  });

  // Sort by confidence descending
  matches.sort((a, b) => b.confidence - a.confidence);

  // Estimate frame length from periodic matches
  let estimatedFrameLengthBytes: number | null = null;
  if (positions.length >= 2) {
    const gaps = [];
    for (let i = 1; i < positions.length; i++) {
      gaps.push(positions[i] - positions[i - 1]);
    }
    // Take median gap
    gaps.sort((a, b) => a - b);
    const medianGap = gaps[Math.floor(gaps.length / 2)];
    estimatedFrameLengthBytes = Math.round(medianGap / 8);
  }

  // Normalize waveform for visualization (downsample if too large)
  const maxWaveformLen = 2048;
  let waveform: Float64Array;
  if (corr.length > maxWaveformLen) {
    waveform = new Float64Array(maxWaveformLen);
    const step = corr.length / maxWaveformLen;
    for (let i = 0; i < maxWaveformLen; i++) {
      const srcIdx = Math.floor(i * step);
      waveform[i] = Math.abs(corr[srcIdx]);
    }
  } else {
    waveform = new Float64Array(corr.length);
    for (let i = 0; i < corr.length; i++) waveform[i] = Math.abs(corr[i]);
  }

  // Normalize waveform to 0-1
  let waveMax = 0;
  for (let i = 0; i < waveform.length; i++) {
    if (waveform[i] > waveMax) waveMax = waveform[i];
  }
  if (waveMax > 0) {
    for (let i = 0; i < waveform.length; i++) waveform[i] /= waveMax;
  }

  const bestPeakVal = values.length > 0 ? Math.max(...values) : 0;
  const bestPsrDb = 20 * Math.log10(Math.max(bestPeakVal, 1e-10) / Math.max(avgSidelobe, 1e-10));

  return {
    matches: matches.slice(0, 20), // Limit to top 20 matches
    correlationWaveform: waveform,
    peakValue: bestPeakVal,
    sidelobeLevel: avgSidelobe,
    bestPsrDb: Math.round(bestPsrDb * 10) / 10,
    estimatedFrameLengthBytes,
    processingTimeMs: performance.now() - start,
  };
}

/**
 * Run correlation against all known sync patterns.
 * Returns the best-matching pattern and its results.
 */
export function autoCorrelate(
  data: Uint8Array,
  threshold: number = 0.6
): { bestPattern: SyncPattern | null; result: CorrelationResult } {
  let bestResult: CorrelationResult | null = null;
  let bestPattern: SyncPattern | null = null;
  let bestScore = -Infinity;

  for (const pattern of KNOWN_SYNC_PATTERNS) {
    const result = correlateStream(data, pattern, threshold);
    const score = result.bestPsrDb * result.matches.length;

    if (score > bestScore && result.matches.length > 0) {
      bestScore = score;
      bestResult = result;
      bestPattern = pattern;
    }
  }

  if (!bestResult) {
    bestResult = {
      matches: [],
      correlationWaveform: new Float64Array(0),
      peakValue: 0,
      sidelobeLevel: 0,
      bestPsrDb: 0,
      estimatedFrameLengthBytes: null,
      processingTimeMs: 0,
    };
  }

  return { bestPattern, result: bestResult };
}
