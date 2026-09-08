/**
 * SignalLens AI — Signal Metrics Engine
 *
 * Estimates signal quality parameters from I/Q data:
 *   - Symbol rate via cyclostationary analysis
 *   - SNR from spectral measurements
 *   - Confidence scoring for each parameter
 */

import { welchPSD, findPeaks, estimateBandwidth3dB, estimateSNR, nextPow2, fft, type WindowType } from './fft';

export interface SignalMetrics {
  samplingFreqHz: number;
  samplingFreqConfidence: number;
  estimatedSymbolRateHz: number;
  symbolRateConfidence: number;
  estimatedBandwidthHz: number;
  bandwidthConfidence: number;
  estimatedSnrDb: number;
  snrQuality: 'Optimal' | 'Good' | 'Degraded' | 'Marginal';
  centerFreqHz: number;
  carrierLocked: boolean;
  noiseFloorDb: number;
  signalPeakDb: number;
  overallConfidence: number;
}

/**
 * Estimate symbol rate using spectral self-correlation (simplified cyclostationary).
 * The squared-magnitude of the signal reveals spectral lines at the symbol rate.
 */
function estimateSymbolRate(
  iq: Float64Array | Float32Array,
  sampleRate: number,
  fftSize: number = 4096
): { rateHz: number; confidence: number } {
  const nSamples = iq.length >> 1;
  const N = Math.min(nextPow2(Math.min(nSamples, fftSize * 4)), 65536);

  // Compute |x(t)|^2 — squaring removes carrier, reveals symbol clock
  const squared = new Float64Array(N);
  for (let i = 0; i < N && i < nSamples; i++) {
    const re = iq[i * 2];
    const im = iq[i * 2 + 1];
    squared[i] = re * re + im * im;
  }

  // Remove DC
  let mean = 0;
  for (let i = 0; i < N; i++) mean += squared[i];
  mean /= N;
  for (let i = 0; i < N; i++) squared[i] -= mean;

  // FFT of squared signal
  const real = new Float64Array(N);
  const imag = new Float64Array(N);
  for (let i = 0; i < N; i++) real[i] = squared[i];

  fft(real, imag);

  // Find peaks in magnitude spectrum (skip DC)
  const halfN = N >> 1;
  const mag = new Float64Array(halfN);
  let maxMag = 0;
  let maxBin = 1;
  for (let k = 1; k < halfN; k++) {
    mag[k] = Math.sqrt(real[k] * real[k] + imag[k] * imag[k]);
    if (mag[k] > maxMag) {
      maxMag = mag[k];
      maxBin = k;
    }
  }

  const symbolRateHz = (maxBin * sampleRate) / N;

  // Confidence: how much does the peak stand out from the mean
  let meanMag = 0;
  for (let k = 1; k < halfN; k++) meanMag += mag[k];
  meanMag /= (halfN - 1);
  const peakRatio = maxMag / Math.max(meanMag, 1e-10);
  const confidence = Math.min(99.9, Math.max(50, 50 + 10 * Math.log10(peakRatio)));

  return { rateHz: symbolRateHz, confidence };
}

/**
 * Compute all signal metrics from raw I/Q data.
 */
export function analyzeSignalMetrics(
  iq: Float64Array | Float32Array,
  sampleRate: number,
  fftSize: number = 4096,
  windowType: WindowType = 'blackman-harris'
): SignalMetrics {
  // Compute PSD
  const psd = welchPSD(iq, fftSize, 0.5, windowType);

  // Find spectral peaks
  const peaks = findPeaks(psd, sampleRate, fftSize, 3);

  // Bandwidth estimation
  const bw3dB = estimateBandwidth3dB(psd, sampleRate, fftSize);

  // SNR estimation
  const snr = estimateSNR(psd, sampleRate, fftSize);

  // Symbol rate estimation
  const symbolRate = estimateSymbolRate(iq, sampleRate, fftSize);

  // SNR quality classification
  let snrQuality: 'Optimal' | 'Good' | 'Degraded' | 'Marginal';
  if (snr.snrDb >= 20) snrQuality = 'Optimal';
  else if (snr.snrDb >= 12) snrQuality = 'Good';
  else if (snr.snrDb >= 6) snrQuality = 'Degraded';
  else snrQuality = 'Marginal';

  // Overall confidence — geometric mean of individual confidences
  const bwConfidence = Math.min(99.5, 80 + snr.snrDb * 0.8);
  const snrConfidence = Math.min(99.5, 75 + snr.snrDb * 1.0);
  const overallConfidence = Math.pow(
    (bwConfidence / 100) * (symbolRate.confidence / 100) * (snrConfidence / 100),
    1 / 3
  ) * 100;

  return {
    samplingFreqHz: sampleRate,
    samplingFreqConfidence: 100, // Known from file metadata
    estimatedSymbolRateHz: symbolRate.rateHz,
    symbolRateConfidence: symbolRate.confidence,
    estimatedBandwidthHz: bw3dB.bandwidthHz,
    bandwidthConfidence: bwConfidence,
    estimatedSnrDb: snr.snrDb,
    snrQuality,
    centerFreqHz: bw3dB.centerHz,
    carrierLocked: snr.snrDb > 6,
    noiseFloorDb: snr.noisePowerDb,
    signalPeakDb: snr.signalPowerDb,
    overallConfidence: Math.min(99.9, overallConfidence),
  };
}
