
import { useState } from 'react';
import { SpeakingPrompt, AssessmentResult, AudioAnalysisResult } from '@/types/assessment';
import { StoredResponse, ProcessingProgress } from './types';
import { createStoredResponse } from './responseBatchUtils';
import { useResponseBatchProcessor } from './useResponseBatchProcessor';

export const useResponseStorage = () => {
  const [storedResponses, setStoredResponses] = useState<StoredResponse[]>([]);
  
  const {
    isProcessingAllResponses,
    processingProgress,
    processAllStoredResponses: batchProcess
  } = useResponseBatchProcessor();

  // Store a response for immediate storage without scoring
  const storeResponse = (
    prompt: SpeakingPrompt,
    audioBlob: Blob,
    transcript?: string,
    audioAnalysis?: AudioAnalysisResult,
    questionIndex?: number
  ) => {
    const newResponse = createStoredResponse(
      prompt,
      audioBlob,
      transcript,
      audioAnalysis,
      questionIndex,
      storedResponses.length
    );

    if (!newResponse) {
      return false;
    }
    
    // Add to storage array
    setStoredResponses(prev => {
      const updated = [...prev, newResponse];
      console.log(`Total stored responses: ${updated.length} (ready for batch processing)`);
      return updated;
    });
    
    return true;
  };

  // Process all stored responses in batch at test completion
  const processAllStoredResponses = async (
    sessionId: string,
    studentName?: string,
    setPromptHistory?: (history: { prompt: SpeakingPrompt; result: AssessmentResult }[]) => void
  ): Promise<AssessmentResult | null> => {
    return await batchProcess(storedResponses, sessionId, studentName, setPromptHistory);
  };

  // Reset stored responses
  const resetStoredResponses = () => {
    console.log("Resetting stored responses");
    setStoredResponses([]);
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
