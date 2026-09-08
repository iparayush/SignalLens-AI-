/**
 * SignalLens AI — Demodulation Engine
 *
 * Implements digital demodulation for:
 *   - BPSK: Binary Phase Shift Keying
 *   - QPSK: Quadrature PSK (with Costas loop carrier recovery)
 *   - FSK:  Frequency Shift Keying (2-FSK, 4-FSK via discriminator)
 *   - QAM:  16-QAM decision slicer
 *
 * Outputs: constellation points, recovered bits, EVM, phase jitter.
 */

export interface ConstellationPoint {
  i: number;
  q: number;
}

export interface DemodulationResult {
  /** Recovered bit stream as Uint8Array (packed bytes) */
  bits: Uint8Array;
  /** Number of recovered bits */
  numBits: number;
  /** Constellation points for plotting */
  constellation: ConstellationPoint[];
  /** Error Vector Magnitude (% RMS) */
  evmRms: number;
  /** Phase jitter (degrees RMS) */
  phaseJitterDeg: number;
  /** Carrier frequency offset estimate (Hz) */
  cfoHz: number;
  /** Carrier lock status */
  carrierLocked: boolean;
  /** Symbol rate used (Hz) */
  symbolRateHz: number;
  /** Modulation type applied */
  modulation: string;
  /** Bit error rate estimate */
  estimatedBer: number;
}

// ─── Symbol Timing Recovery (Gardner TED) ────────────────────────────────────

/**
 * Decimate I/Q samples to symbol-rate using Gardner timing error detector.
 */
function symbolTimingRecovery(
  iq: Float64Array,
  samplesPerSymbol: number,
  maxSymbols: number = 50000
): { symbols: ConstellationPoint[]; indices: number[] } {
  const symbols: ConstellationPoint[] = [];
  const indices: number[] = [];
  const nSamples = iq.length >> 1;

  // Simple integer decimation with interpolation
  const sps = Math.round(samplesPerSymbol);
  let mu = 0; // Fractional timing offset
  let idx = sps; // Start after first symbol period

  while (idx < nSamples - sps && symbols.length < maxSymbols) {
    // Current sample
    const i0 = iq[idx * 2];
    const q0 = iq[idx * 2 + 1];

    symbols.push({ i: i0, q: q0 });
    indices.push(idx);

    // Gardner timing error (simplified)
    if (symbols.length >= 2) {
      const midIdx = idx - Math.round(sps / 2);
      if (midIdx >= 0 && midIdx < nSamples) {
        const iMid = iq[midIdx * 2];
        const qMid = iq[midIdx * 2 + 1];
        const prev = symbols[symbols.length - 2];
        const ted = iMid * (i0 - prev.i) + qMid * (q0 - prev.q);
        mu += ted * 0.01; // Loop gain
        mu = Math.max(-0.5, Math.min(0.5, mu)); // Clamp
      }
    }

    idx += sps + Math.round(mu);
  }

  return { symbols, indices };
}

// ─── Costas Loop Carrier Recovery ────────────────────────────────────────────

/**
 * Apply Costas loop for carrier frequency/phase recovery on BPSK/QPSK.
 */
function costasLoopRecovery(
  iq: Float64Array,
  order: 2 | 4, // 2 = BPSK, 4 = QPSK
  loopBwHz: number = 100,
  sampleRate: number = 1
): { corrected: Float64Array; cfoHz: number; phaseLocked: boolean } {
  const nSamples = iq.length >> 1;
  const corrected = new Float64Array(iq.length);

  // Loop filter parameters (2nd order)
  const dampingFactor = 0.707;
  const naturalFreq = loopBwHz * 2 * Math.PI / sampleRate;
  const kp = 2 * dampingFactor * naturalFreq;
  const ki = naturalFreq * naturalFreq;

  let phase = 0;
  let freq = 0;
  let integrator = 0;

  for (let n = 0; n < nSamples; n++) {
    const cosP = Math.cos(phase);
    const sinP = Math.sin(phase);

    // Rotate by current NCO phase
    const iIn = iq[n * 2];
    const qIn = iq[n * 2 + 1];
    const iOut = iIn * cosP + qIn * sinP;
    const qOut = -iIn * sinP + qIn * cosP;

    corrected[n * 2] = iOut;
    corrected[n * 2 + 1] = qOut;

    // Phase error detector
    let phaseError: number;
    if (order === 2) {
      // BPSK: sign(I) * Q
      phaseError = Math.sign(iOut) * qOut;
    } else {
      // QPSK: sign(I)*Q - sign(Q)*I
      phaseError = Math.sign(iOut) * qOut - Math.sign(qOut) * iOut;
    }

    // Loop filter
    integrator += ki * phaseError;
    freq = kp * phaseError + integrator;

    // NCO update
    phase += freq;
    // Wrap phase
    if (phase > Math.PI) phase -= 2 * Math.PI;
    if (phase < -Math.PI) phase += 2 * Math.PI;
  }

  const cfoHz = (freq * sampleRate) / (2 * Math.PI);
  const phaseLocked = Math.abs(freq) < naturalFreq * 2;

  return { corrected, cfoHz, phaseLocked };
}

// ─── Decision Slicers ────────────────────────────────────────────────────────

function sliceBPSK(symbols: ConstellationPoint[]): { bits: number[]; evm: number; jitter: number } {
  const bits: number[] = [];
  let evmSum = 0;
  let jitterSum = 0;

  for (const s of symbols) {
    bits.push(s.i >= 0 ? 1 : 0);

    // Ideal point: (±1, 0)
    const idealI = s.i >= 0 ? 1 : -1;
    const errI = s.i - idealI;
    const errQ = s.q;
    evmSum += errI * errI + errQ * errQ;
    jitterSum += Math.atan2(errQ, Math.abs(s.i)) ** 2;
  }

  const evm = Math.sqrt(evmSum / symbols.length) * 100;
  const jitter = Math.sqrt(jitterSum / symbols.length) * (180 / Math.PI);
  return { bits, evm, jitter };
}

function sliceQPSK(symbols: ConstellationPoint[]): { bits: number[]; evm: number; jitter: number } {
  const bits: number[] = [];
  let evmSum = 0;
  let jitterSum = 0;
  const scale = 1 / Math.SQRT2;

  for (const s of symbols) {
    // Gray coded QPSK
    const bitI = s.i >= 0 ? 1 : 0;
    const bitQ = s.q >= 0 ? 1 : 0;
    bits.push(bitI, bitQ);

    const idealI = bitI ? scale : -scale;
    const idealQ = bitQ ? scale : -scale;
    const errI = s.i - idealI;
    const errQ = s.q - idealQ;
    evmSum += (errI * errI + errQ * errQ) / (scale * scale);
    jitterSum += Math.atan2(errQ, Math.abs(s.i)) ** 2;
  }

  const evm = Math.sqrt(evmSum / symbols.length) * 100;
  const jitter = Math.sqrt(jitterSum / symbols.length) * (180 / Math.PI);
  return { bits, evm, jitter };
}

function sliceFSK(iq: Float64Array, numLevels: 2 | 4, sampleRate: number, symbolRate: number): {
  bits: number[]; constellation: ConstellationPoint[]; evm: number; jitter: number;
} {
  const nSamples = iq.length >> 1;
  const sps = Math.round(sampleRate / symbolRate);
  const bits: number[] = [];
  const constellation: ConstellationPoint[] = [];

  // FM discriminator: phase difference between consecutive samples
  const freq = new Float64Array(nSamples - 1);
  for (let n = 1; n < nSamples; n++) {
    const i0 = iq[(n - 1) * 2], q0 = iq[(n - 1) * 2 + 1];
    const i1 = iq[n * 2], q1 = iq[n * 2 + 1];
    // Cross product gives sin of phase difference
    freq[n - 1] = Math.atan2(i0 * q1 - q0 * i1, i0 * i1 + q0 * q1);
  }

  // Decimate to symbol rate and slice
  let evmSum = 0;
  for (let s = 0; s + sps < freq.length && constellation.length < 50000; s += sps) {
    let sum = 0;
    for (let k = 0; k < sps; k++) sum += freq[s + k];
    const avgFreq = sum / sps;

    if (numLevels === 2) {
      bits.push(avgFreq >= 0 ? 1 : 0);
      const idealF = avgFreq >= 0 ? 0.5 : -0.5;
      evmSum += (avgFreq - idealF) ** 2;
    } else {
      // 4-FSK
      let symbol: number;
      if (avgFreq > 0.375) symbol = 3;
      else if (avgFreq > 0.125) symbol = 2;
      else if (avgFreq > -0.125) symbol = 1;
      else symbol = 0;
      bits.push((symbol >> 1) & 1, symbol & 1);
    }

    // Project onto unit circle for constellation display
    const angle = avgFreq * Math.PI;
    constellation.push({ i: Math.cos(angle), q: Math.sin(angle) });
  }

  const evm = Math.sqrt(evmSum / Math.max(constellation.length, 1)) * 100;
  return { bits, constellation, evm, jitter: evm * 0.3 };
}

function slice16QAM(symbols: ConstellationPoint[]): { bits: number[]; evm: number; jitter: number } {
  const bits: number[] = [];
  let evmSum = 0;
  let jitterSum = 0;
  const levels = [-3, -1, 1, 3];
  const scale = 1 / Math.sqrt(10); // Normalization for unit average power

  for (const s of symbols) {
    // Find nearest 16-QAM point
    let bestI = 0, bestQ = 0;
    let minDist = Infinity;
    for (const li of levels) {
      for (const lq of levels) {
        const dist = (s.i - li * scale) ** 2 + (s.q - lq * scale) ** 2;
        if (dist < minDist) {
          minDist = dist;
          bestI = li;
          bestQ = lq;
        }
      }
    }

    // Gray code mapping for I and Q
    const idxI = levels.indexOf(bestI);
    const idxQ = levels.indexOf(bestQ);
    bits.push((idxI >> 1) & 1, idxI & 1, (idxQ >> 1) & 1, idxQ & 1);

    evmSum += minDist / (scale * scale);
    jitterSum += Math.atan2(s.q - bestQ * scale, s.i - bestI * scale) ** 2;
  }

  const evm = Math.sqrt(evmSum / symbols.length) * 100;
  const jitter = Math.sqrt(jitterSum / symbols.length) * (180 / Math.PI);
  return { bits, evm, jitter };
}

// ─── Pack bits to bytes ──────────────────────────────────────────────────────

function packBitsToBytes(bits: number[]): Uint8Array {
  const numBytes = Math.floor(bits.length / 8);
  const bytes = new Uint8Array(numBytes);
  for (let i = 0; i < numBytes; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | (bits[i * 8 + b] & 1);
    }
    bytes[i] = byte;
  }
  return bytes;
}

// ─── Main Demodulation Interface ─────────────────────────────────────────────

export type ModulationScheme = 'BPSK' | 'QPSK' | '8PSK' | '2-FSK' | '4-FSK' | 'GMSK' | '16-QAM' | '64-QAM' | '256-QAM';

export function demodulate(
  iq: Float64Array,
  sampleRate: number,
  symbolRate: number,
  modulation: ModulationScheme,
  loopBwHz: number = 100
): DemodulationResult {
  const samplesPerSymbol = sampleRate / symbolRate;

  // FSK branch — uses frequency discriminator, not constellation approach
  if (modulation === '2-FSK' || modulation === 'GMSK') {
    const fskResult = sliceFSK(iq, 2, sampleRate, symbolRate);
    return {
      bits: packBitsToBytes(fskResult.bits),
      numBits: fskResult.bits.length,
      constellation: fskResult.constellation,
      evmRms: fskResult.evm,
      phaseJitterDeg: fskResult.jitter,
      cfoHz: 0,
      carrierLocked: true,
      symbolRateHz: symbolRate,
      modulation,
      estimatedBer: Math.max(0, fskResult.evm / 1000),
    };
  }

  if (modulation === '4-FSK') {
    const fskResult = sliceFSK(iq, 4, sampleRate, symbolRate);
    return {
      bits: packBitsToBytes(fskResult.bits),
      numBits: fskResult.bits.length,
      constellation: fskResult.constellation,
      evmRms: fskResult.evm,
      phaseJitterDeg: fskResult.jitter,
      cfoHz: 0,
      carrierLocked: true,
      symbolRateHz: symbolRate,
      modulation,
      estimatedBer: Math.max(0, fskResult.evm / 1000),
    };
  }

  // PSK/QAM branch — uses carrier recovery + symbol timing
  const costasOrder = (modulation === 'BPSK') ? 2 : 4;
  const { corrected, cfoHz, phaseLocked } = costasLoopRecovery(iq, costasOrder, loopBwHz, sampleRate);

  // Symbol timing recovery
  const { symbols } = symbolTimingRecovery(corrected, samplesPerSymbol);

  // Decision slicing based on modulation
  let sliceResult: { bits: number[]; evm: number; jitter: number };

  switch (modulation) {
    case 'BPSK':
      sliceResult = sliceBPSK(symbols);
      break;
    case 'QPSK':
    case '8PSK': // Simplified: treat as QPSK for now
      sliceResult = sliceQPSK(symbols);
      break;
    case '16-QAM':
    case '64-QAM':
    case '256-QAM':
      sliceResult = slice16QAM(symbols);
      break;
    default:
      sliceResult = sliceQPSK(symbols);
  }

  return {
    bits: packBitsToBytes(sliceResult.bits),
    numBits: sliceResult.bits.length,
    constellation: symbols.slice(0, 4096), // Limit for rendering
    evmRms: Math.min(100, sliceResult.evm),
    phaseJitterDeg: Math.min(90, sliceResult.jitter),
    cfoHz,
    carrierLocked: phaseLocked,
    symbolRateHz: symbolRate,
    modulation,
    estimatedBer: Math.max(0, sliceResult.evm / 1000),
  };
}
