
import React from 'react';
import { AssessmentResult } from '@/types/assessment';
import { MistakeCategory } from '@/components/assessment/mistakes/types';
import {
  analyzePronunciationMistakes,
  analyzeGrammarMistakes,
  analyzeFluencyMistakes,
  analyzeStructureMistakes,
  analyzeVocabularyMistakes
} from './mistakes';

/**
 * Analyze mistakes from assessment result using current detection capabilities
 */
export const analyzeMistakes = (result: AssessmentResult): MistakeCategory[] => {
  const categories: MistakeCategory[] = [];
  const transcript = result.transcript || '';
  
  if (!transcript) return categories;

  // Pronunciation mistakes (MFA-powered)
  const pronunciationMistakes = analyzePronunciationMistakes(result);
  if (pronunciationMistakes.mistakes.length > 0 || pronunciationMistakes.summaryStats) {
    categories.push({
      name: 'Pronunciation Issues',
      mistakes: pronunciationMistakes.mistakes,
      icon: React.createElement('div', { className: 'w-4 h-4 bg-pink-500 rounded' }),
      color: 'bg-pink-100 text-pink-800',
      summaryStats: pronunciationMistakes.summaryStats
    });
  }

  // Grammar mistakes (uses API if available)
  const grammarMistakes = analyzeGrammarMistakes(transcript, result.audioAnalysis);
  if (grammarMistakes.length > 0) {
    categories.push({
      name: 'Grammar',
      mistakes: grammarMistakes,
      icon: React.createElement('div', { className: 'w-4 h-4 bg-red-500 rounded' }),
      color: 'bg-red-100 text-red-800'
    });
  }

  // Fluency issues
  const fluencyMistakes = analyzeFluencyMistakes(transcript);
  if (fluencyMistakes.length > 0) {
    categories.push({
      name: 'Fluency & Speech Flow',
      mistakes: fluencyMistakes,
      icon: React.createElement('div', { className: 'w-4 h-4 bg-orange-500 rounded' }),
      color: 'bg-orange-100 text-orange-800'
    });
  }

  // Structure and coherence
  const structureMistakes = analyzeStructureMistakes(transcript, result);
  if (structureMistakes.length > 0) {
    categories.push({
      name: 'Sentence Structure & Coherence',
      mistakes: structureMistakes,
      icon: React.createElement('div', { className: 'w-4 h-4 bg-blue-500 rounded' }),
      color: 'bg-blue-100 text-blue-800'
    });
  }

  // Vocabulary issues (basic analysis)
  const vocabularyMistakes = analyzeVocabularyMistakes(transcript);
  if (vocabularyMistakes.length > 0) {
    categories.push({
      name: 'Vocabulary & Word Choice',
      mistakes: vocabularyMistakes,
      icon: React.createElement('div', { className: 'w-4 h-4 bg-purple-500 rounded' }),
      color: 'bg-purple-100 text-purple-800'
    });
  }

  return categories;
};
