/**
 * SignalLens AI — Confidence-Tied Threat Scorer (PRD 4.6)
 *
 * Threat/priority level is computed from an aggregate of multiple
 * pipeline confidence indicators — never from a single metric alone.
 *
 * Levels and their evidentiary bars:
 *   Critical : overallConfidence > 90 AND significant match AND SNR > 20 AND modConf > 85
 *   High     : overallConfidence > 75 AND significant match AND SNR > 15
 *   Medium   : overallConfidence > 50
 *   Low      : everything else (including all UNDETERMINED reports)
 */

export type ThreatLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ThreatScoreInputs {
  /** Overall pipeline confidence (0–100%) */
  overallConfidence: number;
  /** True when at least one sync pattern ≥ 4 bytes matched (4.4) */
  hasSignificantMatch: boolean;
  /** Estimated SNR in dB */
  snrDb: number;
  /** Modulation classification confidence (0–100%) */
  modConfidence: number;
  /** EVM RMS (%). If ≥ 30, upstream lock failed. */
  evmRms: number;
  /** True when FEC was UNDETERMINED (upstream lock failed) */
  fecUndetermined: boolean;
}

/**
 * Compute the threat/priority level from pipeline evidence.
 *
 * A report with poor lock or low confidence cannot be "High" or "Critical".
 * This function is the SINGLE authoritative source for threat level assignment.
 */
export function computeThreatLevel(inputs: ThreatScoreInputs): ThreatLevel {
  const {
    overallConfidence,
    hasSignificantMatch,
    snrDb,
    modConfidence,
    evmRms,
    fecUndetermined,
  } = inputs;

  // If any upstream stage returned UNDETERMINED → cap at Low
  if (fecUndetermined || evmRms >= 30) return 'Low';

  // Critical: very high confidence across all dimensions
  if (
    overallConfidence > 90 &&
    hasSignificantMatch &&
    snrDb > 20 &&
    modConfidence > 85
  ) {
    return 'Critical';
  }

  // High: above-average confidence with a verified sync word
  if (overallConfidence > 75 && hasSignificantMatch && snrDb > 15) {
    return 'High';
  }

  // Medium: moderate confidence
  if (overallConfidence > 50) {
    return 'Medium';
  }

  return 'Low';
}

/**
 * Returns a human-readable classification label based on threat level and
 * overall confidence. Replaces hardcoded "TOP SECRET // NOFORN" (4.6).
 */
export function classificationLabel(
  threatLevel: ThreatLevel,
  overallConfidence: number
): string {
  if (overallConfidence < 50) {
    return 'LOW-CONFIDENCE INTERCEPT — Unverified';
  }
  switch (threatLevel) {
    case 'Critical':
      return 'SIGINT INTERCEPT — CRITICAL PRIORITY';
    case 'High':
      return 'SIGINT INTERCEPT — HIGH PRIORITY';
    case 'Medium':
      return 'SIGINT INTERCEPT — MEDIUM PRIORITY';
    default:
      return 'SIGINT INTERCEPT — LOW PRIORITY / UNVERIFIED';
  }
}
