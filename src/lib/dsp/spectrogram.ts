/**
 * SignalLens AI — STFT Spectrogram Engine
 *
 * Computes Short-Time Fourier Transform for waterfall/spectrogram display.
 * Outputs a 2D power array [time_slices × freq_bins] in dB.
 */

import { fft, generateWindow, type WindowType } from './fft';

export interface SpectrogramResult {
  /** 2D power array: rows = time slices, cols = frequency bins (fftSize/2+1) */
  data: Float64Array[];
  /** Number of time slices */
  timeSlices: number;
  /** Number of frequency bins per slice */
  freqBins: number;
  /** Time duration per slice in seconds */
  sliceDuration: number;
  /** Frequency resolution per bin in Hz */
  freqResolution: number;
  /** Global min power (dB) for colormap normalization */
  minPowerDb: number;
  /** Global max power (dB) for colormap normalization */
  maxPowerDb: number;
}

/**
 * Compute STFT spectrogram from interleaved I/Q data.
 *
 * @param iq         — Interleaved I/Q samples [I0, Q0, I1, Q1, ...]
 * @param sampleRate — Sampling rate in Hz
 * @param fftSize    — FFT size (power of 2)
 * @param overlap    — Overlap fraction (0.0 to 0.9, default 0.5)
 * @param window     — Window type
 * @param maxSlices  — Max number of time slices to compute (prevents OOM)
 */
export function computeSpectrogram(
  iq: Float64Array | Float32Array,
  sampleRate: number,
  fftSize: number = 1024,
  overlap: number = 0.5,
  window: WindowType = 'blackman-harris',
  maxSlices: number = 512
): SpectrogramResult {
  const nSamples = iq.length >> 1;
  const hopSize = Math.max(1, Math.floor(fftSize * (1 - overlap)));
  const halfN = (fftSize >> 1) + 1;
  const win = generateWindow(window, fftSize);

  const slices: Float64Array[] = [];
  let globalMin = Infinity;
  let globalMax = -Infinity;

  const real = new Float64Array(fftSize);
  const imag = new Float64Array(fftSize);

  for (let offset = 0; offset + fftSize <= nSamples && slices.length < maxSlices; offset += hopSize) {
    // Apply window and fill FFT buffers
    for (let n = 0; n < fftSize; n++) {
      const idx = (offset + n) * 2;
      real[n] = iq[idx] * win[n];
      imag[n] = iq[idx + 1] * win[n];
    }

    fft(real, imag);

    // Compute power spectrum in dB
    const slice = new Float64Array(halfN);
    const scale = 1.0 / fftSize;
    for (let k = 0; k < halfN; k++) {
      const re = real[k] * scale;
      const im = imag[k] * scale;
      const power = re * re + im * im;
      slice[k] = 10 * Math.log10(Math.max(power, 1e-20));
      if (slice[k] < globalMin) globalMin = slice[k];
      if (slice[k] > globalMax) globalMax = slice[k];
    }

    slices.push(slice);
  }

  return {
    data: slices,
    timeSlices: slices.length,
    freqBins: halfN,
    sliceDuration: hopSize / sampleRate,
    freqResolution: sampleRate / fftSize,
    minPowerDb: globalMin,
    maxPowerDb: globalMax,
  };
}

/**
 * Convert a spectrogram to a flat RGBA pixel array for Canvas rendering.
 * Uses a cyan-green tactical colormap matching the SignalLens UI.
 *
 * @param spectrogram — SpectrogramResult from computeSpectrogram
 * @param width       — Output pixel width (will be stretched/sampled)
 * @param height      — Output pixel height
 * @returns           — Uint8ClampedArray of RGBA pixels (width × height × 4)
 */
export function spectrogramToRGBA(
  spectrogram: SpectrogramResult,
  width: number,
  height: number
): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(width * height * 4);
  const { data, timeSlices, freqBins, minPowerDb, maxPowerDb } = spectrogram;
  const range = maxPowerDb - minPowerDb || 1;

  for (let py = 0; py < height; py++) {
    // Map pixel Y to time slice (top = most recent)
    const sliceIdx = Math.min(
      Math.floor((py / height) * timeSlices),
      timeSlices - 1
    );
    const slice = data[sliceIdx];

    for (let px = 0; px < width; px++) {
      // Map pixel X to frequency bin
      const binIdx = Math.min(
        Math.floor((px / width) * freqBins),
        freqBins - 1
      );

      // Normalize to 0..1
      const norm = Math.max(0, Math.min(1, (slice[binIdx] - minPowerDb) / range));

      // Tactical colormap: dark blue → cyan → green → white
      let r: number, g: number, b: number;
      if (norm < 0.25) {
        const t = norm / 0.25;
        r = 10 + t * 5;
        g = 14 + t * 13;
        b = 24 + t * 40;
      } else if (norm < 0.5) {
        const t = (norm - 0.25) / 0.25;
        r = 15 + t * 60;
        g = 27 + t * 155;
        b = 64 + t * 142;
      } else if (norm < 0.75) {
        const t = (norm - 0.5) / 0.25;
        r = 75 + t * 3;
        g = 182 + t * 40;
        b = 206 - t * 40;
      } else {
        const t = (norm - 0.75) / 0.25;
        r = 78 + t * 177;
        g = 222 + t * 33;
        b = 166 - t * 20;
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
