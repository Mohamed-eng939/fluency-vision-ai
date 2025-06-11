
import { useState } from 'react';
import { SpeakingPrompt, AssessmentResult, AudioAnalysisResult } from '@/types/assessment';
import { processRecordingForAssessment } from '@/utils/assessment/audioProcessingUtils';
import { applyCEFRCalibration } from '@/utils/scoring/cefrAssessmentResults';

interface StoredResponse {
  prompt: SpeakingPrompt;
  audioBlob: Blob;
  transcript?: string;
  audioAnalysis?: AudioAnalysisResult;
  timestamp: number;
  questionIndex: number;
}

export const useResponseStorage = () => {
  const [storedResponses, setStoredResponses] = useState<StoredResponse[]>([]);
  const [isProcessingAllResponses, setIsProcessingAllResponses] = useState(false);

  // Store a response for later processing with validation
  const storeResponse = (
    prompt: SpeakingPrompt,
    audioBlob: Blob,
    transcript?: string,
    audioAnalysis?: AudioAnalysisResult,
    questionIndex?: number
  ) => {
    // Validate audio blob before storing
    if (!audioBlob || audioBlob.size === 0) {
      console.error("Invalid audio blob - size is 0 or null");
      return false;
    }

    console.log(`Storing response for question ${questionIndex}: Audio size=${audioBlob.size} bytes`);
    
    const newResponse: StoredResponse = {
      prompt,
      audioBlob,
      transcript,
      audioAnalysis,
      timestamp: Date.now(),
      questionIndex: questionIndex || storedResponses.length
    };
    
    // Prevent overwriting - add to array instead of replacing
    setStoredResponses(prev => {
      const updated = [...prev, newResponse];
      console.log(`Total stored responses: ${updated.length}`);
      return updated;
    });
    
    return true;
  };

  // Process all stored responses with aggregated scoring
  const processAllStoredResponses = async (
    sessionId: string,
    studentName?: string,
    setPromptHistory?: (history: { prompt: SpeakingPrompt; result: AssessmentResult }[]) => void
  ): Promise<AssessmentResult | null> => {
    console.log("Processing all stored responses:", storedResponses.length);
    setIsProcessingAllResponses(true);
    
    try {
      const processedHistory: { prompt: SpeakingPrompt; result: AssessmentResult }[] = [];
      const allResults: AssessmentResult[] = [];
      
      // Process each response individually
      for (const [index, response] of storedResponses.entries()) {
        try {
          console.log(`Processing response ${index + 1}/${storedResponses.length} for prompt:`, response.prompt.text.substring(0, 50));
          
          const result = await processRecordingForAssessment(
            response.audioBlob,
            response.transcript,
            response.audioAnalysis,
            response.prompt,
            {
              sessionId,
              name: studentName,
            }
          );
          
          // Apply CEFR calibration
          const enhancedResult = applyCEFRCalibration(result, response.audioAnalysis);
          
          processedHistory.push({
            prompt: response.prompt,
            result: enhancedResult
          });
          
          allResults.push(enhancedResult);
          
        } catch (error) {
          console.error(`Error processing response ${index + 1}:`, error);
          // Continue with next response even if one fails
        }
      }
      
      // Calculate aggregated final result
      const aggregatedResult = calculateAggregatedResult(allResults, sessionId, studentName);
      
      // Update prompt history with processed results
      if (setPromptHistory) {
        setPromptHistory(processedHistory);
      }
      
      return aggregatedResult;
      
    } catch (error) {
      console.error("Error processing stored responses:", error);
      return null;
    } finally {
      setIsProcessingAllResponses(false);
    }
  };

  // Calculate aggregated result from all individual results
  const calculateAggregatedResult = (
    results: AssessmentResult[],
    sessionId: string,
    studentName?: string
  ): AssessmentResult | null => {
    if (results.length === 0) return null;

    console.log(`Aggregating ${results.length} results`);

    // Aggregate metrics by averaging
    const aggregatedMetrics = {
      fluency: results.reduce((sum, r) => sum + r.metrics.fluency, 0) / results.length,
      grammar: results.reduce((sum, r) => sum + r.metrics.grammar, 0) / results.length,
      vocabulary: results.reduce((sum, r) => sum + r.metrics.vocabulary, 0) / results.length,
      pronunciation: results.reduce((sum, r) => sum + r.metrics.pronunciation, 0) / results.length,
      prosody: results.reduce((sum, r) => sum + r.metrics.prosody, 0) / results.length,
      coherence: results.reduce((sum, r) => sum + r.metrics.coherence, 0) / results.length,
      syntax: results.reduce((sum, r) => sum + r.metrics.syntax, 0) / results.length
    };

    // Aggregate audio analysis data
    const aggregatedAudioAnalysis = aggregateAudioAnalysis(results);

    // Calculate total score and CEFR level
    const totalScore = Object.values(aggregatedMetrics).reduce((sum, score) => sum + score, 0) / Object.keys(aggregatedMetrics).length;
    
    // Determine CEFR level from aggregated score
    const cefrLevel = determineCEFRFromScore(totalScore);

    console.log("Aggregated metrics:", aggregatedMetrics);
    console.log("Aggregated total score:", totalScore);
    console.log("Final CEFR level:", cefrLevel);

    return {
      sessionId,
      learnerName: studentName,
      metrics: aggregatedMetrics,
      totalScore,
      cefrLevel,
      audioAnalysis: aggregatedAudioAnalysis,
      transcript: results.map(r => r.transcript).filter(Boolean).join(' '),
      duration: results.reduce((sum, r) => sum + (r.duration || 0), 0),
      feedback: `Assessment based on ${results.length} speaking tasks`
    };
  };

  // Aggregate audio analysis data from all results
  const aggregateAudioAnalysis = (results: AssessmentResult[]): AudioAnalysisResult => {
    const validAnalyses = results.filter(r => r.audioAnalysis).map(r => r.audioAnalysis!);
    
    if (validAnalyses.length === 0) {
      return {
        wpm: 0,
        totalWords: 0,
        pauseCount: 0,
        pauseDuration: 0,
        pauseRatio: 0,
        speakingDuration: 0,
        totalDuration: 0
      };
    }

    // Sum up all the metrics across responses
    const totalWords = validAnalyses.reduce((sum, a) => sum + (a.totalWords || 0), 0);
    const totalSpeakingDuration = validAnalyses.reduce((sum, a) => sum + (a.speakingDuration || 0), 0);
    const totalDuration = validAnalyses.reduce((sum, a) => sum + (a.totalDuration || 0), 0);
    const totalPauseCount = validAnalyses.reduce((sum, a) => sum + (a.pauseCount || 0), 0);
    const totalPauseDuration = validAnalyses.reduce((sum, a) => sum + (a.pauseDuration || 0), 0);

    // Calculate aggregated metrics
    const wpm = totalSpeakingDuration > 0 ? (totalWords / totalSpeakingDuration) * 60 : 0;
    const syllableCount = validAnalyses.reduce((sum, a) => sum + (a.syllableCount || 0), 0);
    const syllablesPerMinute = totalSpeakingDuration > 0 ? (syllableCount / totalSpeakingDuration) * 60 : 0;

    console.log("Aggregated audio metrics:", {
      totalWords,
      totalSpeakingDuration,
      wpm,
      syllablesPerMinute
    });

    return {
      wpm,
      totalWords,
      pauseCount: totalPauseCount,
      pauseDuration: totalPauseDuration,
      pauseRatio: totalDuration > 0 ? totalPauseDuration / totalDuration : 0,
      speakingDuration: totalSpeakingDuration,
      totalDuration,
      syllableCount,
      syllablesPerMinute,
      fluencyScore: validAnalyses.reduce((sum, a) => sum + (a.fluencyScore || 0), 0) / validAnalyses.length
    };
  };

  // Determine CEFR level from numerical score
  const determineCEFRFromScore = (score: number): string => {
    if (score >= 9) return 'C2';
    if (score >= 8) return 'C1';
    if (score >= 7) return 'B2';
    if (score >= 6) return 'B1';
    if (score >= 5) return 'A2';
    return 'A1';
  };

  // Reset stored responses
  const resetStoredResponses = () => {
    console.log("Resetting stored responses");
    setStoredResponses([]);
    setIsProcessingAllResponses(false);
  };

  return {
    storedResponses,
    isProcessingAllResponses,
    storeResponse,
    processAllStoredResponses,
    resetStoredResponses,
    getStoredResponsesCount: () => storedResponses.length
  };
};
