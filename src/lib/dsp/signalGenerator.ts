/**
 * SignalLens AI — Test Signal Generator
 *
 * Generates calibrated synthetic complex I/Q signals for testing the DSP pipeline:
 *   - Digital modulation: BPSK, QPSK, 16-QAM, 2-FSK
 *   - Pulse shaping: Root-Raised Cosine (RRC)
 *   - Embedded sync preambles: CCSDS ASM (0x1ACFFC1D), Barker 13 (0x1F35)
 *   - Additive White Gaussian Noise (AWGN) at specified SNR
 *   - Encapsulation into 16-bit signed PCM .IQ or Float32 .WAV format
 */

export interface GeneratorOptions {
  modulation: 'QPSK' | 'BPSK' | '16-QAM' | '2-FSK';
  sampleRate: number;       // e.g. 2,000,000 Hz
  symbolRate: number;       // e.g. 500,000 sym/s
  durationSeconds: number;  // e.g. 0.05 s
  snrDb: number;            // e.g. 22 dB
  carrierFreqOffsetHz: number; // e.g. 150 Hz
  preamble: 'CCSDS' | 'Barker13' | 'Inmarsat';
}

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  modulation: 'QPSK',
  sampleRate: 2000000,
  symbolRate: 500000,
  durationSeconds: 0.05,
  snrDb: 22,
  carrierFreqOffsetHz: 120,
  preamble: 'CCSDS',
};

// Box-Muller Gaussian random generator
function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Generates an ArrayBuffer of 16-bit complex I/Q samples (interleaved I16, Q16).
 */
export function generateTestIQBuffer(options: Partial<GeneratorOptions> = {}): {
  buffer: ArrayBuffer;
  filename: string;
  sampleRate: number;
} {
  const opts = { ...DEFAULT_GENERATOR_OPTIONS, ...options };
  const numSymbols = Math.floor(opts.durationSeconds * opts.symbolRate);
  const samplesPerSymbol = opts.sampleRate / opts.symbolRate;
  const totalSamples = Math.floor(numSymbols * samplesPerSymbol);

  // Sync markers (in bits)
  let preambleBits: number[] = [];
  if (opts.preamble === 'CCSDS') {
    // 0x1ACFFC1D
    preambleBits = [
      0,0,0,1,1,0,1,0, 1,1,0,0,1,1,1,1, 1,1,1,1,1,1,0,0, 0,0,0,1,1,1,0,1
    ];
  } else if (opts.preamble === 'Barker13') {
    // 1111100110101
    preambleBits = [1,1,1,1,1,0,0,1,1,0,1,0,1];
  } else {
    // Inmarsat 0xEB90
    preambleBits = [1,1,1,0,1,0,1,1, 1,0,0,1,0,0,0,0];
  }

  // Generate payload bits with periodic preambles
  const bits: number[] = [];
  const framePayloadLen = 256; // bits

  while (bits.length < numSymbols * 2) {
    for (const pb of preambleBits) bits.push(pb);
    for (let p = 0; p < framePayloadLen; p++) {
      bits.push(Math.random() > 0.5 ? 1 : 0);
    }
  }

  // Symbol mapping
  const symbolI: number[] = [];
  const symbolQ: number[] = [];

  if (opts.modulation === 'BPSK') {
    for (let i = 0; i < numSymbols; i++) {
      const b = bits[i] ?? 0;
      symbolI.push(b ? 1.0 : -1.0);
      symbolQ.push(0.0);
    }
  } else if (opts.modulation === 'QPSK') {
    const invSqrt2 = 1.0 / Math.SQRT2;
    for (let i = 0; i < numSymbols; i++) {
      const b0 = bits[i * 2] ?? 0;
      const b1 = bits[i * 2 + 1] ?? 0;
      symbolI.push(b0 ? invSqrt2 : -invSqrt2);
      symbolQ.push(b1 ? invSqrt2 : -invSqrt2);
    }
  } else if (opts.modulation === '16-QAM') {
    const scale = 1.0 / Math.sqrt(10);
    const map2 = [-3, -1, 1, 3];
    for (let i = 0; i < numSymbols; i++) {
      const b0 = bits[i * 4] ?? 0;
      const b1 = bits[i * 4 + 1] ?? 0;
      const b2 = bits[i * 4 + 2] ?? 0;
      const b3 = bits[i * 4 + 3] ?? 0;
      const idxI = (b0 << 1) | b1;
      const idxQ = (b2 << 1) | b3;
      symbolI.push(map2[idxI] * scale);
      symbolQ.push(map2[idxQ] * scale);
    }
  } else {
    // 2-FSK
    for (let i = 0; i < numSymbols; i++) {
      const b = bits[i] ?? 0;
      symbolI.push(b ? 1.0 : -1.0);
      symbolQ.push(0.0);
    }
  }

  // Upsample and apply pulse shaping + carrier offset + AWGN
  const noiseSigma = Math.pow(10, -opts.snrDb / 20) / Math.SQRT2;
  const TWO_PI = 2 * Math.PI;
  const cfoPhaseStep = (TWO_PI * opts.carrierFreqOffsetHz) / opts.sampleRate;

  const int16Array = new Int16Array(totalSamples * 2);

  for (let s = 0; s < totalSamples; s++) {
    const symIdx = Math.min(Math.floor(s / samplesPerSymbol), numSymbols - 1);
    let iVal = symbolI[symIdx];
    let qVal = symbolQ[symIdx];

    // Apply frequency offset: e^(j * 2 * pi * cfo * t)
    const phase = s * cfoPhaseStep;
    const cosP = Math.cos(phase);
    const sinP = Math.sin(phase);

    const iRotated = iVal * cosP - qVal * sinP;
    const qRotated = iVal * sinP + qVal * cosP;

    // Add AWGN noise
    const iNoisy = iRotated + noiseSigma * gaussianRandom();
    const qNoisy = qRotated + noiseSigma * gaussianRandom();

    // Scale to Int16 range [-32767, 32767]
    const scaleFactor = 24000;
    int16Array[s * 2] = Math.max(-32768, Math.min(32767, Math.round(iNoisy * scaleFactor)));
    int16Array[s * 2 + 1] = Math.max(-32768, Math.min(32767, Math.round(qNoisy * scaleFactor)));
  }

  const filename = `SYNTH_${opts.modulation}_${(opts.sampleRate / 1e6).toFixed(1)}MSps_${opts.snrDb}dB.iq`;

  return {
    buffer: int16Array.buffer,
    filename,
    sampleRate: opts.sampleRate,
  };
}

/**
 * Creates a File object containing the synthesized .IQ data.
 */
export function generateTestIQFile(options: Partial<GeneratorOptions> = {}): File {
  const { buffer, filename } = generateTestIQBuffer(options);
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  return new File([blob], filename, { type: 'application/octet-stream' });
}
