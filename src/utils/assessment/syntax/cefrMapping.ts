
/**
 * Convert CEFR level to numeric score
 */
export const convertCEFRLevelToScore = (level: string): number => {
  if (!level) return 5.0;
  
  switch (level.toUpperCase()) {
    case 'C2': return 9.0;
    case 'C1+': return 8.0;
    case 'C1': return 7.5;
    case 'B2+': return 7.0;
    case 'B2': return 6.5;
    case 'B1+': return 6.0;
    case 'B1': return 5.0;
    case 'A2+': return 4.0;
    case 'A2': return 3.5;
    case 'A1+': return 3.0;
    case 'A1': return 2.0;
    default: return 5.0;
  }
};
