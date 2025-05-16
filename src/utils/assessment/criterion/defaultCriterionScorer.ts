
/**
 * Calculate a default criterion score when no specific scorer is available
 * @returns A value between 6-9
 */
export const calculateDefaultCriterion = (): number => {
  return Math.random() * 3 + 6;
};
