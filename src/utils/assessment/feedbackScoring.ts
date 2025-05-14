
import { CEFRLevel } from "../../types/assessment";

/**
 * Get specific feedback for a criterion based on score and level
 */
export const getCriterionFeedback = (criterion: string, score: number, level: string): string => {
  // This would be expanded with much more detailed, criterion-specific feedback
  if (score > 8) {
    return `Your ${criterion} shows excellent mastery at ${level} level. Keep up the great work!`;
  } else if (score > 6) {
    return `Your ${criterion} is good for ${level} level, showing solid competence with minor areas to improve.`;
  } else if (score > 4) {
    return `Your ${criterion} is adequate for ${level} level, but shows several areas where focused practice would help.`;
  } else {
    return `Your ${criterion} needs significant improvement to meet ${level} level standards. Consider focused practice.`;
  }
};
