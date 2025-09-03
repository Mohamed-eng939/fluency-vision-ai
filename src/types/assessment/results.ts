
import { CEFRLevel } from './basic';
import { AudioAnalysisResult } from './audio';

export interface AssessmentMetrics {
  overall?: number; // Add overall score
  fluency: number;
  grammar: number;
  pronunciation: number;
  prosody: number;
  vocabulary: number;
  syntax: number;
  coherence: number;
  // Optional skill metrics for full assessments
  listening?: number;
  reading?: number;
  writing?: number;
}

export interface AssessmentFeedback {
  fluency: string;
  grammar: string;
  pronunciation: string;
  prosody: string;
  vocabulary: string;
  syntax: string;
  coherence: string;
  overall: string;
  // Optional skill feedback for full assessments
  listening?: string;
  reading?: string;
  writing?: string;
}

export interface CoherenceAnalysis {
  method: 'external_api' | 'local_sbert' | 'traditional' | 'local_fallback';
  sbertScore?: number;
  crossEncoderScore?: number;
  averageScore?: number;
  promptReference?: string;
  apiLatency?: number;
  isFallback?: boolean;
  fallbackReason?: string;
}

export interface FallbackInfo {
  prosodyFallback?: boolean;
  prosodyFallbackReason?: string;
  coherenceFallback?: boolean;
  coherenceFallbackReason?: string;
}

export interface AssessmentResult {
  metrics: AssessmentMetrics;
  totalScore: number;
  cefrLevel: CEFRLevel;
  feedback: AssessmentFeedback;
  audioUrl?: string;
  duration?: number;
  speechRate?: number;
  confidenceScore?: number;
  transcript?: string;
  // Additional metadata for reports
  audioAnalysis?: AudioAnalysisResult;
  learnerName?: string;
  sessionId?: string;
  dateOfTest?: string;
  assessmentType?: 'quick' | 'full';
  assessmentName?: string;
  // Enhanced coherence analysis data
  coherenceAnalysis?: CoherenceAnalysis;
  // Fallback detection flags
  fallbackInfo?: FallbackInfo;
}
