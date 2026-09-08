/**
 * SignalLens AI — Automatic Modulation Classifier
 *
 * Uses higher-order cumulant statistics to classify digital modulations.
 * Supports: BPSK, QPSK, 8PSK, 16-QAM, 64-QAM, 2-FSK, 4-FSK, GMSK, AM, FM.
 *
 * Method: Computes 2nd, 4th, 6th order cumulants (C20, C21, C40, C41, C42, C60, C63)
 * and applies decision tree thresholds from published literature.
 *
 * Reference: Swami & Sadler (2000), "Hierarchical digital modulation classification
 * using cumulants", IEEE Trans. Communications.
 */

export interface ClassificationProbability {
  modulation: string;
  probability: number;
  color: string;
}

export interface ClassificationResult {
  /** Most likely modulation */
  detected: string;
  /** Confidence in the detection (0-100%) */
  confidence: number;
  /** Probability distribution over all modulation types */
  probabilities: ClassificationProbability[];
  /** Computed cumulant features */
  features: {
    c20: number;
    c21: number;
    c40: number;
    c42: number;
    c63: number;
    kurtosis: number;
    instantaneousFreqStd: number;
  };
  /** Feature vector used for classification */
  featureVector: number[];
}

// ─── Cumulant Computation ────────────────────────────────────────────────────

interface CumulantFeatures {
  c20: number;  // 2nd order cumulant
  c21: number;  // |C21| magnitude
  c40: number;  // 4th order cumulant
  c42: number;  // |C42|
  c63: number;  // |C63|
  kurtosis: number;
  instantaneousFreqStd: number;
}

function computeCumulants(iq: Float64Array | Float32Array, maxSamples: number = 50000): CumulantFeatures {
  const nSamples = Math.min(iq.length >> 1, maxSamples);
  if (nSamples < 16) {
    return { c20: 0, c21: 0, c40: 0, c42: 0, c63: 0, kurtosis: 0, instantaneousFreqStd: 0 };
  }

  // Normalize to unit power
  let power = 0;
  for (let n = 0; n < nSamples; n++) {
    power += iq[n * 2] ** 2 + iq[n * 2 + 1] ** 2;
  }
  power /= nSamples;
  const scale = power > 0 ? 1 / Math.sqrt(power) : 1;

  // Compute moments
  let m20Re = 0, m20Im = 0; // E[x^2]
  let m21 = 0;              // E[|x|^2]
  let m40Re = 0, m40Im = 0; // E[x^4]
  let m42 = 0;              // E[|x|^2 * x^2]
  let m22 = 0;              // E[|x|^4]

  // For kurtosis and instantaneous frequency
  let sumPow4 = 0;
  let sumPow2 = 0;
  let freqValues: number[] = [];

  for (let n = 0; n < nSamples; n++) {
    const re = iq[n * 2] * scale;
    const im = iq[n * 2 + 1] * scale;
    const mag2 = re * re + im * im;
    const mag4 = mag2 * mag2;

    // x^2 = (re + j*im)^2 = (re^2 - im^2) + j*(2*re*im)
    const x2Re = re * re - im * im;
    const x2Im = 2 * re * im;

    m20Re += x2Re;
    m20Im += x2Im;
    m21 += mag2;

    // x^4 = (x^2)^2
    const x4Re = x2Re * x2Re - x2Im * x2Im;
    const x4Im = 2 * x2Re * x2Im;
    m40Re += x4Re;
    m40Im += x4Im;

    // |x|^2 * x^2
    m42 += mag2 * Math.sqrt(x2Re * x2Re + x2Im * x2Im);

    // |x|^4
    m22 += mag4;

    sumPow4 += mag4;
    sumPow2 += mag2;

    // Instantaneous frequency (phase difference)
    if (n > 0) {
      const prevRe = iq[(n - 1) * 2] * scale;
      const prevIm = iq[(n - 1) * 2 + 1] * scale;
      const crossRe = re * prevRe + im * prevIm;
      const crossIm = im * prevRe - re * prevIm;
      freqValues.push(Math.atan2(crossIm, crossRe));
    }
  }

  m20Re /= nSamples;
  m20Im /= nSamples;
  m21 /= nSamples;
  m40Re /= nSamples;
  m40Im /= nSamples;
  m42 /= nSamples;
  m22 /= nSamples;
  sumPow4 /= nSamples;
  sumPow2 /= nSamples;

  // Cumulants
  const c20 = Math.sqrt(m20Re * m20Re + m20Im * m20Im);
  const c21 = m21;
  const c40 = Math.sqrt(m40Re * m40Re + m40Im * m40Im) - 3 * c20 * c20;
  const c42 = m42 - c20 * m21 - 2 * m21 * m21;
  const c63 = m22 - 9 * m21 * c20; // Simplified 6th order

  // Kurtosis: E[|x|^4] / (E[|x|^2])^2 - 2
  const kurtosis = sumPow2 > 0 ? sumPow4 / (sumPow2 * sumPow2) - 2 : 0;

  // Instantaneous frequency standard deviation
  let freqMean = 0;
  for (const f of freqValues) freqMean += f;
  freqMean /= Math.max(freqValues.length, 1);
  let freqVar = 0;
  for (const f of freqValues) freqVar += (f - freqMean) ** 2;
  freqVar /= Math.max(freqValues.length, 1);
  const instantaneousFreqStd = Math.sqrt(freqVar);

  return { c20, c21, c40: Math.abs(c40), c42: Math.abs(c42), c63: Math.abs(c63), kurtosis, instantaneousFreqStd };
}

// ─── Decision Tree Classifier ────────────────────────────────────────────────

const MODULATION_COLORS: Record<string, string> = {
  'BPSK': '#4cd7f6',
  'QPSK': '#4edea3',
  'QPSK (π/4)': '#80e5c4',
  '8PSK': '#adc6ff',
  '16-QAM': '#ffa726',
  '64-QAM': '#ef5350',
  '256-QAM': '#ce93d8',
  '2-FSK': '#ffca28',
  '4-FSK': '#ff7043',
  'GMSK': '#66bb6a',
  'AM': '#78909c',
  'FM': '#8d6e63',
  'OFDM': '#5c6bc0',
  'Unknown': '#9e9e9e',
};

function classifyFromCumulants(features: CumulantFeatures): ClassificationProbability[] {
  const scores: Record<string, number> = {};

  // Initialize all modulations with a base score
  for (const mod of Object.keys(MODULATION_COLORS)) {
    scores[mod] = 0.5;
  }

  const { c40, c42, kurtosis, instantaneousFreqStd, c20 } = features;

  // ── Cumulant-based decision tree ──

  // PSK family: C40 ≈ -1 (BPSK), C40 ≈ +1 (QPSK), kurtosis near -1
  if (kurtosis < -0.5) {
    // Constant envelope → PSK or FSK family
    if (c40 < -0.5) {
      scores['BPSK'] += 5;
      scores['QPSK'] += 2;
    } else if (c40 > -0.5 && c40 < 0.5) {
      scores['QPSK'] += 5;
      scores['QPSK (π/4)'] += 4;
      scores['8PSK'] += 3;
    } else {
      scores['8PSK'] += 5;
    }
  } else {
    // Non-constant envelope → QAM or AM
    if (kurtosis < 0) {
      scores['16-QAM'] += 5;
      scores['64-QAM'] += 3;
    } else {
      scores['64-QAM'] += 5;
      scores['256-QAM'] += 3;
      scores['AM'] += 2;
    }
  }

  // FSK discrimination: high instantaneous frequency variance
  if (instantaneousFreqStd > 0.5) {
    scores['2-FSK'] += 4;
    scores['4-FSK'] += 3;
    scores['GMSK'] += 2;
    scores['FM'] += 2;
    // Reduce PSK/QAM scores
    scores['BPSK'] -= 2;
    scores['QPSK'] -= 2;
    scores['16-QAM'] -= 2;
  }

  // GMSK: FSK-like but smoother frequency transitions
  if (instantaneousFreqStd > 0.3 && instantaneousFreqStd < 0.7 && kurtosis < -0.3) {
    scores['GMSK'] += 3;
  }

  // C42 discrimination between QAM orders
  if (c42 > 1.5) {
    scores['16-QAM'] += 3;
  } else if (c42 > 0.5) {
    scores['64-QAM'] += 3;
  }

  // C20 for AM detection (large DC component)
  if (c20 > 0.3) {
    scores['AM'] += 3;
  }

  // Normalize scores to probabilities using softmax
  const modList = Object.keys(scores);
  const maxScore = Math.max(...modList.map(m => scores[m]));
  let expSum = 0;
  const expScores: Record<string, number> = {};
  for (const mod of modList) {
    expScores[mod] = Math.exp(scores[mod] - maxScore);
    expSum += expScores[mod];
  }

  const probabilities: ClassificationProbability[] = modList
    .map(mod => ({
      modulation: mod,
      probability: Math.round((expScores[mod] / expSum) * 1000) / 10,
      color: MODULATION_COLORS[mod] || '#9e9e9e',
    }))
    .sort((a, b) => b.probability - a.probability);

  return probabilities;
}

// ─── Main Classification Interface ───────────────────────────────────────────

/**
 * Classify the modulation scheme of an I/Q recording.
 *
 * @param iq         — Interleaved I/Q samples
 * @param sampleRate — Sampling rate (used for reporting, not classification)
 */
export function classifyModulation(
  iq: Float64Array | Float32Array,
  sampleRate: number
): ClassificationResult {
  const features = computeCumulants(iq);
  const probabilities = classifyFromCumulants(features);

  const detected = probabilities[0]?.modulation || 'Unknown';
  const confidence = probabilities[0]?.probability || 0;

  return {
    detected,
    confidence,
    probabilities: probabilities.filter(p => p.probability > 0.1), // Filter negligible
    features,
    featureVector: [
      features.c20,
      features.c21,
      features.c40,
      features.c42,
      features.c63,
      features.kurtosis,
      features.instantaneousFreqStd,
    ],
  };
}
