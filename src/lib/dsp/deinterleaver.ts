/**
 * SignalLens AI — De-interleaving Engine
 *
 * Implements:
 *   - Block de-interleaver (matrix transpose)
 *   - Convolutional de-interleaver (Forney/Ramsey type)
 *   - Diagonal de-interleaver
 *   - Pseudo-random de-interleaver (PRNG-based permutation)
 */

export type DeinterleaverType = 'block' | 'convolutional' | 'diagonal' | 'pseudorandom';

export interface DeinterleaveResult {
  /** De-interleaved bit/byte stream */
  data: Uint8Array;
  /** Type used */
  type: DeinterleaverType;
  /** Human-readable name */
  label: string;
  /** Matrix dimensions or depth used */
  params: string;
  /** Number of burst errors dispersed (estimated) */
  burstErrorsDispersed: number;
  /** Processing time (ms) */
  processingTimeMs: number;
  /**
   * Dispersion quality score (higher = better burst dispersal).
   * Computed as mean run-length reciprocal: 1 / mean_run of identical bits.
   * Used for candidate ranking (4.10).
   */
  score: number;
  /** True when upstream demod failed confidence threshold — this result is notional (4.1) */
  undetermined?: boolean;
  /** Reason string when undetermined (4.1) */
  undeterminedReason?: string;
}

/**
 * Block de-interleaver: data was written row-by-row, read column-by-column.
 * We reverse this: write column-by-column, read row-by-row.
 */
export function blockDeinterleave(
  data: Uint8Array,
  rows: number,
  cols: number
): DeinterleaveResult {
  const start = performance.now();
  const blockSize = rows * cols;
  const numBlocks = Math.floor(data.length / blockSize);
  const output = new Uint8Array(data.length);

  for (let b = 0; b < numBlocks; b++) {
    const baseIn = b * blockSize;
    const baseOut = b * blockSize;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Interleaver wrote rows, read cols → de-interleaver reverses
        const srcIdx = baseIn + c * rows + r;
        const dstIdx = baseOut + r * cols + c;
        if (srcIdx < data.length) {
          output[dstIdx] = data[srcIdx];
        }
      }
    }
  }

  // Copy remaining bytes that don't fill a complete block
  const remainder = numBlocks * blockSize;
  for (let i = remainder; i < data.length; i++) {
    output[i] = data[i];
  }

  return {
    data: output,
    type: 'block',
    label: 'Block Matrix',
    params: `${rows}×${cols} Matrix`,
    burstErrorsDispersed: Math.floor(data.length / blockSize) * rows,
    processingTimeMs: performance.now() - start,
    score: computeDispersionScore(output),
  };
}

/**
 * Convolutional de-interleaver (Forney type).
 * Uses I branches with delays of 0, M, 2M, ..., (I-1)*M.
 */
export function convolutionalDeinterleave(
  data: Uint8Array,
  branches: number = 16,
  delayIncrement: number = 17
): DeinterleaveResult {
  const start = performance.now();
  const output = new Uint8Array(data.length);

  // Create delay line buffers for each branch
  const maxDelay = (branches - 1) * delayIncrement;
  const delays: number[][] = [];
  for (let i = 0; i < branches; i++) {
    const delay = (branches - 1 - i) * delayIncrement; // Reverse of interleaver
    delays.push(new Array(delay).fill(0));
  }

  let outIdx = 0;
  for (let n = 0; n < data.length; n++) {
    const branch = n % branches;
    const delayLine = delays[branch];

    if (delayLine.length > 0) {
      // Push new sample, pop oldest
      delayLine.push(data[n]);
      output[outIdx++] = delayLine.shift()!;
    } else {
      output[outIdx++] = data[n];
    }
  }

  return {
    data: output,
    type: 'convolutional',
    label: 'Convolutional (Forney)',
    params: `I=${branches}, M=${delayIncrement}`,
    burstErrorsDispersed: Math.floor(data.length / branches),
    processingTimeMs: performance.now() - start,
    score: computeDispersionScore(output),
  };
}

/**
 * Diagonal de-interleaver.
 * Reads diagonally from a matrix that was written row-by-row.
 */
export function diagonalDeinterleave(
  data: Uint8Array,
  rows: number,
  cols: number
): DeinterleaveResult {
  const start = performance.now();
  const blockSize = rows * cols;
  const numBlocks = Math.floor(data.length / blockSize);
  const output = new Uint8Array(data.length);

  for (let b = 0; b < numBlocks; b++) {
    const base = b * blockSize;
    let outOff = 0;

    // Read along diagonals
    for (let d = 0; d < rows + cols - 1; d++) {
      for (let r = Math.max(0, d - cols + 1); r <= Math.min(d, rows - 1); r++) {
        const c = d - r;
        if (c >= 0 && c < cols) {
          const srcIdx = base + r * cols + c;
          const dstIdx = base + outOff;
          if (srcIdx < data.length && dstIdx < data.length) {
            output[dstIdx] = data[srcIdx];
          }
          outOff++;
        }
      }
    }
  }

  // Copy remainder
  const remainder = numBlocks * blockSize;
  for (let i = remainder; i < data.length; i++) output[i] = data[i];

  return {
    data: output,
    type: 'diagonal',
    label: 'Diagonal',
    params: `${rows}×${cols} Diagonal`,
    burstErrorsDispersed: Math.floor(data.length / blockSize) * Math.min(rows, cols),
    processingTimeMs: performance.now() - start,
    score: computeDispersionScore(output),
  };
}

/**
 * Pseudo-random de-interleaver.
 * Uses a seeded PRNG to generate a permutation table, then applies inverse.
 */
export function pseudorandomDeinterleave(
  data: Uint8Array,
  blockSize: number = 256,
  seed: number = 42
): DeinterleaveResult {
  const start = performance.now();
  const output = new Uint8Array(data.length);

  // Simple LCG PRNG for reproducibility
  let state = seed;
  function nextRand(): number {
    state = (state * 1103515245 + 12345) & 0x7FFFFFFF;
    return state;
  }

  // Generate permutation table (Fisher-Yates shuffle)
  const perm = new Uint32Array(blockSize);
  for (let i = 0; i < blockSize; i++) perm[i] = i;
  for (let i = blockSize - 1; i > 0; i--) {
    const j = nextRand() % (i + 1);
    const tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp;
  }

  // Build inverse permutation (for de-interleaving)
  const invPerm = new Uint32Array(blockSize);
  for (let i = 0; i < blockSize; i++) invPerm[perm[i]] = i;

  // Apply inverse permutation block by block
  const numBlocks = Math.floor(data.length / blockSize);
  for (let b = 0; b < numBlocks; b++) {
    const base = b * blockSize;
    for (let i = 0; i < blockSize; i++) {
      output[base + invPerm[i]] = data[base + i];
    }
  }

  // Copy remainder
  for (let i = numBlocks * blockSize; i < data.length; i++) output[i] = data[i];

  return {
    data: output,
    type: 'pseudorandom',
    label: 'Pseudo-Random',
    params: `Block=${blockSize}, Seed=${seed}`,
    burstErrorsDispersed: numBlocks * Math.floor(Math.sqrt(blockSize)),
    processingTimeMs: performance.now() - start,
    score: computeDispersionScore(output),
  };
}

// ─── Dispersion Score ─────────────────────────────────────────────────────────

/**
 * Compute a dispersion quality score for a de-interleaved byte stream.
 *
 * Score = 1 / mean_run_length (bit level).
 * A perfectly dispersed stream has short runs → high score.
 * Returns a value in [0, 1]; higher = better burst dispersal.
 */
function computeDispersionScore(data: Uint8Array): number {
  const N = Math.min(data.length, 1024); // Limit computation
  if (N < 2) return 0.5;

  let runs = 0;
  let prevBit = (data[0] >> 7) & 1;

  for (let i = 0; i < N; i++) {
    for (let b = 7; b >= 0; b--) {
      const bit = (data[i] >> b) & 1;
      if (bit !== prevBit) {
        runs++;
        prevBit = bit;
      }
    }
  }

  const totalBits = N * 8;
  const meanRunLength = totalBits / Math.max(runs, 1);
  return Math.min(1, 1 / meanRunLength);
}

// ─── Main Interface ──────────────────────────────────────────────────────────

/**
 * Run de-interleaving with the specified type and parameters.
 */
export function deinterleave(
  data: Uint8Array,
  type: DeinterleaverType,
  rows: number = 16,
  cols: number = 32
): DeinterleaveResult {
  switch (type) {
    case 'block':
      return blockDeinterleave(data, rows, cols);
    case 'convolutional':
      return convolutionalDeinterleave(data, rows, cols);
    case 'diagonal':
      return diagonalDeinterleave(data, rows, cols);
    case 'pseudorandom':
      return pseudorandomDeinterleave(data, rows * cols);
    default:
      return blockDeinterleave(data, rows, cols);
  }
}

/**
 * Try all four de-interleaver types with standard parameters.
 * Returns all results sorted by score descending — best candidate first.
 * Used for transparency reporting (PRD 4.10).
 */
export function tryAllDeinterleavers(
  data: Uint8Array,
  rows: number = 16,
  cols: number = 32
): DeinterleaveResult[] {
  const candidates: DeinterleaveResult[] = [
    blockDeinterleave(data, rows, cols),
    convolutionalDeinterleave(data, rows, cols),
    diagonalDeinterleave(data, rows, cols),
    pseudorandomDeinterleave(data, rows * cols),
  ];
  return candidates.sort((a, b) => b.score - a.score);
}
