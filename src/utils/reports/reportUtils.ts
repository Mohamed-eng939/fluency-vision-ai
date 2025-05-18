
import { CEFRLevel } from '@/types/assessment';

/**
 * Map numeric score (0-100) to CEFR level
 */
export const mapScoreToCEFR = (score: number): CEFRLevel => {
  if (score >= 95) return 'C2';
  if (score >= 90) return 'C1+';
  if (score >= 85) return 'C1';
  if (score >= 80) return 'B2+';
  if (score >= 70) return 'B2';
  if (score >= 65) return 'B1+';
  if (score >= 55) return 'B1';
  if (score >= 45) return 'A2+';
  if (score >= 35) return 'A2';
  if (score >= 25) return 'A1+';
  if (score >= 15) return 'A1';
  return 'Pre-A1';
};

/**
 * Get CEFR color by level
 */
export const getCEFRColor = (level: CEFRLevel): string => {
  const colorMap: Record<CEFRLevel, string> = {
    'C2': '#10b981',     // Green
    'C1+': '#14b8a6',    // Teal-green
    'C1': '#0ea5e9',     // Blue
    'B2+': '#3b82f6',    // Medium blue
    'B2': '#6366f1',     // Indigo
    'B1+': '#8b5cf6',    // Purple
    'B1': '#a855f7',     // Purple-pink
    'A2+': '#d946ef',    // Pink
    'A2': '#ec4899',     // Hot pink
    'A1+': '#f43f5e',    // Red-pink
    'A1': '#ef4444',     // Red
    'Pre-A1': '#f97316', // Orange
  };
  
  return colorMap[level] || '#9ca3af'; // Gray default
};

/**
 * Format date for report
 */
export const formatReportDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get CEFR descriptions
 */
export const getCEFRDescription = (level: CEFRLevel): string => {
  const descriptions: Record<CEFRLevel, string> = {
    'C2': 'Can understand with ease virtually everything heard or read. Can summarize information from different spoken and written sources, reconstructing arguments and accounts in a coherent presentation.',
    'C1+': 'Can understand a wide range of demanding, longer texts, and recognize implicit meaning. Can express ideas fluently and spontaneously with high precision.',
    'C1': 'Can understand a wide range of demanding, longer texts, and recognize implicit meaning. Can express themselves fluently and spontaneously without much obvious searching for expressions.',
    'B2+': 'Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain for either party.',
    'B2': 'Can understand the main ideas of complex text on both concrete and abstract topics. Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers possible.',
    'B1+': 'Can produce simple connected text on topics that are familiar or of personal interest with increased complexity and coherence.',
    'B1': 'Can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc. Can deal with most situations likely to arise while traveling.',
    'A2+': 'Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar and routine matters with increased confidence.',
    'A2': 'Can understand sentences and frequently used expressions related to areas of most immediate relevance. Can communicate in simple and routine tasks requiring a simple and direct exchange of information.',
    'A1+': 'Can introduce themselves and others and can ask and answer questions about personal details with increased vocabulary and confidence.',
    'A1': 'Can understand and use familiar everyday expressions and very basic phrases aimed at the satisfaction of needs of a concrete type.',
    'Pre-A1': 'Can understand and use some basic expressions and very simple phrases. Limited ability to communicate.'
  };
  
  return descriptions[level] || 'No description available for this level.';
};
