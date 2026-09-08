/**
 * SignalLens AI — FFT & Spectral Analysis Engine
 *
 * Pure TypeScript implementation of:
 *   - Cooley-Tukey Radix-2 FFT (in-place, decimation-in-time)
 *   - Window functions (Hamming, Blackman-Harris, Hann, Flat-Top)
 *   - Welch Power Spectral Density estimation
 *   - Spectral peak detection
 *   - Bandwidth estimation (-3 dB and 99% occupied)
 */

// ─── Window Functions ────────────────────────────────────────────────────────

export type WindowType = 'hamming' | 'blackman-harris' | 'hann' | 'flat-top' | 'rectangular';

export function generateWindow(type: WindowType, N: number): Float64Array {
  const w = new Float64Array(N);
  const TWO_PI = 2 * Math.PI;
  const FOUR_PI = 4 * Math.PI;
  const SIX_PI = 6 * Math.PI;

  for (let n = 0; n < N; n++) {
    const frac = n / (N - 1);
    switch (type) {
      case 'hamming':
        w[n] = 0.54 - 0.46 * Math.cos(TWO_PI * frac);
        break;
      case 'blackman-harris':
        w[n] =
          0.35875 -
          0.48829 * Math.cos(TWO_PI * frac) +
          0.14128 * Math.cos(FOUR_PI * frac) -
          0.01168 * Math.cos(SIX_PI * frac);
        break;
      case 'hann':
        w[n] = 0.5 * (1 - Math.cos(TWO_PI * frac));
        break;
      case 'flat-top':
        w[n] =
          0.21557895 -
          0.41663158 * Math.cos(TWO_PI * frac) +
          0.277263158 * Math.cos(FOUR_PI * frac) -
          0.083578947 * Math.cos(SIX_PI * frac) +
          0.006947368 * Math.cos(8 * Math.PI * frac);
        break;
      case 'rectangular':
      default:
        w[n] = 1.0;
        break;
    }
  }
  return w;
}

// ─── Cooley-Tukey Radix-2 FFT ───────────────────────────────────────────────

/**
 * In-place radix-2 decimation-in-time FFT.
 * @param real — Real part of input (modified in-place to hold output)
 * @param imag — Imaginary part of input (modified in-place to hold output)
 * Length MUST be a power of 2.
 */
export function fft(real: Float64Array, imag: Float64Array): void {
  const N = real.length;
  if (N <= 1) return;

  // Bit-reversal permutation
  let j = 0;
  for (let i = 0; i < N - 1; i++) {
    if (i < j) {
      let tmp = real[i]; real[i] = real[j]; real[j] = tmp;
      tmp = imag[i]; imag[i] = imag[j]; imag[j] = tmp;
    }
    let m = N >> 1;
    while (m >= 1 && j >= m) {
      j -= m;
      m >>= 1;
    }
    j += m;
  }

  // Butterfly stages
  for (let size = 2; size <= N; size <<= 1) {
    const halfSize = size >> 1;
    const angleStep = -2 * Math.PI / size;
    const wReal = Math.cos(angleStep);
    const wImag = Math.sin(angleStep);

    for (let start = 0; start < N; start += size) {
      let curReal = 1.0;
      let curImag = 0.0;

      for (let k = 0; k < halfSize; k++) {
        const even = start + k;
        const odd = even + halfSize;

        const tReal = curReal * real[odd] - curImag * imag[odd];
        const tImag = curReal * imag[odd] + curImag * real[odd];

        real[odd] = real[even] - tReal;
        imag[odd] = imag[even] - tImag;
        real[even] += tReal;
        imag[even] += tImag;

        const nextReal = curReal * wReal - curImag * wImag;
        curImag = curReal * wImag + curImag * wReal;
        curReal = nextReal;
      }
    }
  }
}

/**
 * Compute the magnitude spectrum in dB from complex FFT output.
 * Returns N/2 + 1 bins (positive frequencies only).
 */
export function magnitudeSpectrum(real: Float64Array, imag: Float64Array): Float64Array {
  const N = real.length;
  const halfN = (N >> 1) + 1;
  const mag = new Float64Array(halfN);
  const scale = 1.0 / N;

  for (let k = 0; k < halfN; k++) {
    const re = real[k] * scale;
    const im = imag[k] * scale;
    const power = re * re + im * im;
    mag[k] = 10 * Math.log10(Math.max(power, 1e-20));
  }
  return mag;
}

/**
 * Compute Power Spectral Density using Welch's method.
 * @param iq       — Interleaved I/Q samples [I0, Q0, I1, Q1, ...]
 * @param fftSize  — FFT size (power of 2, e.g. 4096)
 * @param overlap  — Overlap fraction (0.0 to 0.9, default 0.5)
 * @param window   — Window type to apply
 * @returns        — PSD array in dB (fftSize/2 + 1 bins)
 */
export function welchPSD(
  iq: Float64Array | Float32Array,
  fftSize: number,
  overlap: number = 0.5,
  window: WindowType = 'blackman-harris'
): Float64Array {
  const nSamples = iq.length >> 1; // Number of complex samples
  const hopSize = Math.max(1, Math.floor(fftSize * (1 - overlap)));
  const halfN = (fftSize >> 1) + 1;
  const psd = new Float64Array(halfN);
  const win = generateWindow(window, fftSize);

  // Compute window power for normalization
  let winPower = 0;
  for (let i = 0; i < fftSize; i++) winPower += win[i] * win[i];
  winPower /= fftSize;

  let nSegments = 0;
  const real = new Float64Array(fftSize);
  const imag = new Float64Array(fftSize);

  for (let offset = 0; offset + fftSize <= nSamples; offset += hopSize) {
    // Fill segment with windowed I/Q
    for (let n = 0; n < fftSize; n++) {
      const idx = (offset + n) * 2;
      real[n] = iq[idx] * win[n];
      imag[n] = iq[idx + 1] * win[n];
    }

    fft(real, imag);

    // Accumulate power
    for (let k = 0; k < halfN; k++) {
      const re = real[k];
      const im = imag[k];
      psd[k] += re * re + im * im;
    }
    nSegments++;
  }

  // Average and convert to dB
  if (nSegments > 0) {
    const norm = 1.0 / (nSegments * fftSize * fftSize * winPower);
    for (let k = 0; k < halfN; k++) {
      psd[k] = 10 * Math.log10(Math.max(psd[k] * norm, 1e-20));
    }
  }

  return psd;
}

// ─── Spectral Analysis Utilities ─────────────────────────────────────────────

export interface SpectralPeak {
  binIndex: number;
  frequencyHz: number;
  powerDb: number;
}

/**
 * Find the top N peaks in a magnitude/PSD spectrum.
 */
export function findPeaks(
  spectrum: Float64Array,
  sampleRate: number,
  fftSize: number,
  topN: number = 5,
  minDistanceBins: number = 10
): SpectralPeak[] {
  const halfN = spectrum.length;
  const binResolution = sampleRate / fftSize;

  // Collect all local maxima
  const candidates: SpectralPeak[] = [];
  for (let k = 1; k < halfN - 1; k++) {
    if (spectrum[k] > spectrum[k - 1] && spectrum[k] > spectrum[k + 1]) {
      candidates.push({
        binIndex: k,
        frequencyHz: k * binResolution,
        powerDb: spectrum[k],
      });
    }
  }

  // Sort by power descending
  candidates.sort((a, b) => b.powerDb - a.powerDb);

  // Pick top-N respecting minimum distance
  const peaks: SpectralPeak[] = [];
  for (const c of candidates) {
    if (peaks.length >= topN) break;
    const tooClose = peaks.some((p) => Math.abs(p.binIndex - c.binIndex) < minDistanceBins);
    if (!tooClose) peaks.push(c);
  }

  return peaks;
}

/**
 * Estimate occupied bandwidth using -3 dB drop from peak.
 */
export function estimateBandwidth3dB(
  spectrum: Float64Array,
  sampleRate: number,
  fftSize: number
): { bandwidthHz: number; lowerHz: number; upperHz: number; centerHz: number } {
  const binRes = sampleRate / fftSize;
  const halfN = spectrum.length;

  // Find peak
  let peakBin = 0;
  let peakVal = -Infinity;
  for (let k = 0; k < halfN; k++) {
    if (spectrum[k] > peakVal) {
      peakVal = spectrum[k];
      peakBin = k;
    }
  }

  const threshold = peakVal - 3;

  // Search left
  let lowerBin = peakBin;
  for (let k = peakBin - 1; k >= 0; k--) {
    if (spectrum[k] < threshold) { lowerBin = k + 1; break; }
    if (k === 0) lowerBin = 0;
  }

  // Search right
  let upperBin = peakBin;
  for (let k = peakBin + 1; k < halfN; k++) {
    if (spectrum[k] < threshold) { upperBin = k - 1; break; }
    if (k === halfN - 1) upperBin = halfN - 1;
  }

  return {
    bandwidthHz: (upperBin - lowerBin) * binRes,
    lowerHz: lowerBin * binRes,
    upperHz: upperBin * binRes,
    centerHz: ((lowerBin + upperBin) / 2) * binRes,
  };
}

/**
 * Estimate occupied bandwidth as the band containing 99% of total power.
 */
export function estimateBandwidth99(
  spectrum: Float64Array,
  sampleRate: number,
  fftSize: number
): { bandwidthHz: number; lowerHz: number; upperHz: number } {
  const binRes = sampleRate / fftSize;
  const halfN = spectrum.length;

  // Convert dB back to linear power
  const power = new Float64Array(halfN);
  let totalPower = 0;
  for (let k = 0; k < halfN; k++) {
    power[k] = Math.pow(10, spectrum[k] / 10);
    totalPower += power[k];
  }

  const target = totalPower * 0.99;
  let cumPower = 0;
  let lowerBin = 0;
  let upperBin = halfN - 1;

  // Find symmetric band from peak outward
  let peakBin = 0;
  let peakPow = 0;
  for (let k = 0; k < halfN; k++) {
    if (power[k] > peakPow) { peakPow = power[k]; peakBin = k; }
  }

  // Expand from peak until 99% captured
  let lo = peakBin;
  let hi = peakBin;
  cumPower = power[peakBin];

  while (cumPower < target && (lo > 0 || hi < halfN - 1)) {
    const loVal = lo > 0 ? power[lo - 1] : -1;
    const hiVal = hi < halfN - 1 ? power[hi + 1] : -1;
    if (loVal >= hiVal && lo > 0) {
      lo--;
      cumPower += power[lo];
    } else if (hi < halfN - 1) {
      hi++;
      cumPower += power[hi];
    } else {
      break;
    }
  }

  return {
    bandwidthHz: (hi - lo) * binRes,
    lowerHz: lo * binRes,
    upperHz: hi * binRes,
  };
}

/**
 * Estimate SNR from PSD: signal power in bandwidth vs noise floor.
 */
export function estimateSNR(
  spectrum: Float64Array,
  sampleRate: number,
  fftSize: number
): { snrDb: number; signalPowerDb: number; noisePowerDb: number } {
  const bw = estimateBandwidth3dB(spectrum, sampleRate, fftSize);
  const binRes = sampleRate / fftSize;
  const halfN = spectrum.length;

  const loBin = Math.max(0, Math.floor(bw.lowerHz / binRes));
  const hiBin = Math.min(halfN - 1, Math.ceil(bw.upperHz / binRes));

  let sigPower = 0;
  let sigCount = 0;
  let noisePower = 0;
  let noiseCount = 0;

  for (let k = 0; k < halfN; k++) {
    const p = Math.pow(10, spectrum[k] / 10);
    if (k >= loBin && k <= hiBin) {
      sigPower += p;
      sigCount++;
    } else {
      noisePower += p;
      noiseCount++;
    }
  }

  const avgSig = sigCount > 0 ? sigPower / sigCount : 1e-20;
  const avgNoise = noiseCount > 0 ? noisePower / noiseCount : 1e-20;

  return {
    snrDb: 10 * Math.log10(avgSig / Math.max(avgNoise, 1e-20)),
    signalPowerDb: 10 * Math.log10(Math.max(avgSig, 1e-20)),
    noisePowerDb: 10 * Math.log10(Math.max(avgNoise, 1e-20)),
  };
}

/**
 * Utility: next power of 2 >= n.
 */
export function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}
