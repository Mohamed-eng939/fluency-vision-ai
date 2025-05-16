
/**
 * Calculate the prosody criterion score based on audio metrics
 */
export const calculateProsodyCriterion = (
  audioMetrics: any
): number => {
  return audioMetrics.pausePattern || 7;
};
