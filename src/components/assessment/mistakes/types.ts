
import React from 'react';

export interface MistakeItem {
  original: string;
  correction: string;
  suggestion: string;
  cefrLevel?: string;
  context?: string;
  phoneme?: string;
  issue?: string;
  startTime?: number;
  endTime?: number;
}

export interface MistakeCategory {
  name: string;
  mistakes: MistakeItem[];
  icon: React.ReactNode;
  color: string;
  summaryStats?: {
    wordAccuracy?: number;
    phonemeAccuracy?: number;
    speechRate?: number;
    targetSpeechRate?: string;
    overallScore?: number;
    cefrLevel?: string;
  };
}
