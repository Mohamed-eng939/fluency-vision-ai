/**
 * Database CEFR levels - matches the Supabase enum
 */
type DatabaseCEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Normalize CEFR level for database storage
 * Converts plus variants (B2+, C1+) to base levels (B2, C1)
 * Maps special levels to closest database equivalent
 */
export const normalizeCEFRForDatabase = (cefrLevel: string): DatabaseCEFRLevel => {
  // Handle plus variants by removing the plus
  const normalized = cefrLevel.replace('+', '');
  
  // Map special cases to valid database levels
  switch (normalized) {
    case 'Pre-A1':
    case 'Below Pre-A1':
      return 'A1';
    case 'A1':
      return 'A1';
    case 'A2':
      return 'A2';
    case 'B1':
      return 'B1';
    case 'B2':
      return 'B2';
    case 'C1':
      return 'C1';
    case 'C2':
      return 'C2';
    case 'N/A':
      return 'A1'; // Default fallback
    default:
      // For any unrecognized level, default to A1
      console.warn(`Unknown CEFR level: ${cefrLevel}, defaulting to A1`);
      return 'A1';
  }
};