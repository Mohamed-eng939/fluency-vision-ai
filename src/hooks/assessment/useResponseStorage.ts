import { useState } from 'react';
import { SpeakingPrompt, AssessmentResult, AudioAnalysisResult, CEFRLevel } from '@/types/assessment';
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
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });

  // Store a response for later processing with enhanced validation
  const storeResponse = (
    prompt: SpeakingPrompt,
    audioBlob: Blob,
    transcript?: string,
    audioAnalysis?: AudioAnalysisResult,
    questionIndex?: number
  ) => {
    // Enhanced validation with size and content checks
    if (!audioBlob || audioBlob.size === 0) {
      console.error("Invalid audio blob - size is 0 or null");
      return false;
    }

    // Check for minimum recording size (prevent very short recordings)
    if (audioBlob.size < 1000) {
      console.error("Audio blob too small - likely invalid recording");
      return false;
    }

    console.log(`Storing response for question ${questionIndex}: Audio size=${audioBlob.size} bytes, transcript=${transcript?.length || 0} chars`);
    
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

  // Process all stored responses with enhanced progress tracking
  const processAllStoredResponses = async (
    sessionId: string,
    studentName?: string,
    setPromptHistory?: (history: { prompt: SpeakingPrompt; result: AssessmentResult }[]) => void
  ): Promise<AssessmentResult | null> => {
    console.log("Starting batch processing of all stored responses:", storedResponses.length);
    setIsProcessingAllResponses(true);
    setProcessingProgress({ current: 0, total: storedResponses.length });
    
    try {
      const processedHistory: { prompt: SpeakingPrompt; result: AssessmentResult }[] = [];
      const allResults: AssessmentResult[] = [];
      
      // Process each response individually with progress updates
      for (const [index, response] of storedResponses.entries()) {
        try {
          console.log(`Processing response ${index + 1}/${storedResponses.length} for prompt:`, response.prompt.text.substring(0, 50));
          setProcessingProgress({ current: index + 1, total: storedResponses.length });
          
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
      setProcessingProgress({ current: 0, total: 0 });
    }
  };

  // Calculate aggregated result from all individual results with improved feedback
  const calculateAggregatedResult = (
    results: AssessmentResult[],
    sessionId: string,
    studentName?: string
  ): AssessmentResult | null => {
    if (results.length === 0) return null;

    console.log(`Aggregating ${results.length} results for comprehensive assessment`);

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

    // Generate smart feedback based on actual performance metrics
    const aggregatedFeedback = generateSmartFeedback(aggregatedMetrics, aggregatedAudioAnalysis, cefrLevel, results.length);

    console.log("Aggregated metrics:", aggregatedMetrics);
    console.log("Aggregated total score:", totalScore);
    console.log("Final CEFR level:", cefrLevel);

    return {
      sessionId,
      learnerName: studentName,
      metrics: aggregatedMetrics,
      totalScore,
      cefrLevel,
      feedback: aggregatedFeedback,
      audioAnalysis: aggregatedAudioAnalysis,
      transcript: results.map(r => r.transcript).filter(Boolean).join(' '),
      duration: results.reduce((sum, r) => sum + (r.duration || 0), 0)
    };
  };

  // Generate smart feedback based on actual performance metrics
  const generateSmartFeedback = (metrics: any, audioAnalysis: AudioAnalysisResult, cefrLevel: CEFRLevel, taskCount: number) => {
    const fluencyScore = metrics.fluency * 10;
    const grammarScore = metrics.grammar * 10;
    const vocabularyScore = metrics.vocabulary * 10;
    const pronunciationScore = metrics.pronunciation * 10;
    
    // Smart fluency feedback based on actual metrics
    let fluencyFeedback = "";
    if (audioAnalysis.wpm === 0 || audioAnalysis.wpm < 60) {
      fluencyFeedback = `Work on increasing speech tempo and reducing hesitation. Current speaking rate needs improvement for ${cefrLevel} level.`;
    } else if (fluencyScore > 70) {
      fluencyFeedback = `Excellent fluency for ${cefrLevel} level. Natural speaking rhythm with minimal hesitation.`;
    } else if (fluencyScore > 50) {
      fluencyFeedback = `Good fluency for ${cefrLevel} level, with some areas for improvement in speech flow.`;
    } else {
      fluencyFeedback = `Work on reducing hesitation and increasing speech tempo to reach ${cefrLevel} level standards.`;
    }

    // Smart grammar feedback
    let grammarFeedback = "";
    if (grammarScore > 70) {
      grammarFeedback = `Strong grammatical accuracy for ${cefrLevel} level with minimal errors.`;
    } else if (grammarScore > 50) {
      grammarFeedback = `Adequate grammar control for ${cefrLevel} level with some areas for improvement.`;
    } else {
      grammarFeedback = `Focus on improving grammatical accuracy to meet ${cefrLevel} level standards.`;
    }

    // Smart vocabulary feedback
    let vocabularyFeedback = "";
    if (vocabularyScore > 70) {
      vocabularyFeedback = `Strong vocabulary range appropriate for ${cefrLevel} level.`;
    } else if (vocabularyScore > 50) {
      vocabularyFeedback = `Good vocabulary usage for ${cefrLevel} level - consider expanding range.`;
    } else {
      vocabularyFeedback = `Work on expanding vocabulary range to meet ${cefrLevel} level expectations.`;
    }

    // Smart pronunciation feedback
    let pronunciationFeedback = "";
    if (pronunciationScore > 70) {
      pronunciationFeedback = `Clear pronunciation suitable for ${cefrLevel} level.`;
    } else if (pronunciationScore > 50) {
      pronunciationFeedback = `Generally clear pronunciation with some areas for improvement at ${cefrLevel} level.`;
    } else {
      pronunciationFeedback = `Focus on pronunciation clarity to improve comprehensibility at ${cefrLevel} level.`;
    }

    return {
      fluency: fluencyFeedback,
      grammar: grammarFeedback,
      vocabulary: vocabularyFeedback,
      pronunciation: pronunciationFeedback,
      prosody: `Prosody analysis ${audioAnalysis.prosodyAnalysis?.failureReason ? 
        `not available (${audioAnalysis.prosodyAnalysis.userFriendlyMessage || audioAnalysis.prosodyAnalysis.failureReason})` : 
        `completed successfully for ${cefrLevel} level`}`,
      coherence: `Coherence and organization appropriate for ${cefrLevel} level based on ${taskCount} speaking tasks.`,
      syntax: `Sentence complexity suitable for ${cefrLevel} level.`,
      overall: `Comprehensive assessment based on ${taskCount} speaking tasks demonstrates ${cefrLevel} level proficiency.`
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
  const determineCEFRFromScore = (score: number): CEFRLevel => {
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
    setProcessingProgress({ current: 0, total: 0 });
  };

  return {
    storedResponses,
    isProcessingAllResponses,
    processingProgress,
    storeResponse,
    processAllStoredResponses,
    resetStoredResponses,
    getStoredResponsesCount: () => storedResponses.length
  };
};
