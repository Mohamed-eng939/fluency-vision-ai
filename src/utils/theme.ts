
// Theme extension for assessment colors
export const assessmentColors = {
  'assessment-blue': '#33C3F0',
  'assessment-teal': '#0FA0CE',
  'assessment-lightBlue': '#1EAEDB',
  'assessment-darkBlue': '#1A1F2C',
  'assessment-green': '#39D353',
  'assessment-yellow': '#FFD700',
  'assessment-orange': '#F97316',
  'assessment-red': '#E11D48',
};

// CEFR level colors
export const cefrLevelColors = {
  'Pre-A1': '#E11D48', // Red
  'A1': '#F97316',     // Orange
  'A1+': '#F97316',    // Orange
  'A2': '#FFD700',     // Yellow
  'A2+': '#FFD700',    // Yellow
  'B1': '#39D353',     // Green
  'B1+': '#39D353',    // Green
  'B2': '#33C3F0',     // Blue
  'B2+': '#33C3F0',    // Blue
  'C1': '#7E69AB',     // Purple
  'C1+': '#7E69AB',    // Purple
  'C2': '#6E59A5',     // Dark Purple
};

// Get color for a specific CEFR level
export const getCefrLevelColor = (level: string): string => {
  return cefrLevelColors[level as keyof typeof cefrLevelColors] || '#33C3F0';
};
