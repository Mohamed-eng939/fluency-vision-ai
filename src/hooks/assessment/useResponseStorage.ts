
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
}

export const useResponseStorage = () => {
  const [storedResponses, setStoredResponses] = useState<StoredResponse[]>([]);
  const [isProcessingAllResponses, setIsProcessingAllResponses] = useState(false);

  // Store a response for later processing
  const storeResponse = (
    prompt: SpeakingPrompt,
    audioBlob: Blob,
    transcript?: string,
    audioAnalysis?: AudioAnalysisResult
  ) => {
    const newResponse: StoredResponse = {
      prompt,
      audioBlob,
      transcript,
      audioAnalysis,
      timestamp: Date.now()
    };
    
    setStoredResponses(prev => [...prev, newResponse]);
  };

  // Process all stored responses at the end of the test
  const processAllStoredResponses = async (
    sessionId: string,
    studentName?: string,
    setPromptHistory?: (history: { prompt: SpeakingPrompt; result: AssessmentResult }[]) => void
  ): Promise<AssessmentResult | null> => {
    console.log("Processing all stored responses:", storedResponses.length);
    setIsProcessingAllResponses(true);
    
    try {
      const processedHistory: { prompt: SpeakingPrompt; result: AssessmentResult }[] = [];
      let lastResult: AssessmentResult | null = null;
      
      for (const response of storedResponses) {
        try {
          console.log("Processing response for prompt:", response.prompt.text);
          
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
          
          lastResult = enhancedResult;
          
        } catch (error) {
          console.error("Error processing response:", error);
          // Continue with next response even if one fails
        }
      }
      
      // Update prompt history with processed results
      if (setPromptHistory) {
        setPromptHistory(processedHistory);
      }
      
      return lastResult;
      
    } catch (error) {
      console.error("Error processing stored responses:", error);
      return null;
    } finally {
      setIsProcessingAllResponses(false);
    }
  };

  // Reset stored responses
  const resetStoredResponses = () => {
    setStoredResponses([]);
    setIsProcessingAllResponses(false);
  };

  return {
    storedResponses,
    isProcessingAllResponses,
    storeResponse,
    processAllStoredResponses,
    resetStoredResponses
  };
};
