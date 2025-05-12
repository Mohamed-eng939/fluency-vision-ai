
import { CEFRLevel } from '../../types/assessment';
import { Rubric } from './types';
import { defaultRubric } from './loaderUtils';

/**
 * Map IELTS band to CEFR level using the rubric mapping
 */
export const mapBandToCEFR = (
  band: number, 
  rubric: Rubric = defaultRubric
): CEFRLevel => {
  // Round to nearest 0.5
  const roundedBand = Math.round(band * 2) / 2;
  const bandStr = roundedBand.toString();
  
  // If exact match exists
  if (rubric.mapping.ielts_to_cefr[bandStr]) {
    return rubric.mapping.ielts_to_cefr[bandStr] as CEFRLevel;
  }
  
  // Find the closest match
  const bandNumber = Number(bandStr);
  const bands = Object.keys(rubric.mapping.ielts_to_cefr)
    .map(Number)
    .sort((a, b) => a - b);
  
  // Find the closest band that is less than or equal to the target
  let closestBand = 0;
  for (const band of bands) {
    if (band <= bandNumber) {
      closestBand = band;
    } else {
      break;
    }
  }
  
  return rubric.mapping.ielts_to_cefr[closestBand.toString()] as CEFRLevel;
};

/**
 * Map IELTS band to 5-point scale
 */
export const mapIELTSto5Point = (
  band: number,
  rubric: Rubric = defaultRubric
): number => {
  // If scale conversion exists in rubric
  if (rubric.mapping.scale_conversion?.ielts_to_5point) {
    const conversion = rubric.mapping.scale_conversion.ielts_to_5point;
    
    // Check each range
    for (const range in conversion) {
      if (range.includes('-')) {
        const [min, max] = range.split('-').map(Number);
        if (band >= min && band <= max) {
          return conversion[range] as number;
        }
      } else if (Number(range) === band) {
        return conversion[range] as number;
      }
    }
  }
  
  // Default conversion if not found in rubric
  if (band >= 8) return 5;
  if (band >= 7) return 4;
  if (band >= 6) return 3;
  if (band >= 5) return 2;
  return 1;
};
