
import { useState } from 'react';
import { AssessmentResult, SpeakingPrompt } from '@/types/assessment';
import { processRecordingForAssessment } from '@/utils/assessment/audioProcessingUtils';
import { applyCEFRCalibration } from '@/utils/scoring/cefrAssessmentResults';
import { StoredResponse, ProcessingProgress } from './types';
import { calculateAggregatedResult } from './responseAggregation';
import { useSupabaseStorage } from '../useSupabaseStorage';
import { useAudioUpload } from '@/hooks/useAudioUpload';
export const useResponseBatchProcessor = () => {
  const [isProcessingAllResponses, setIsProcessingAllResponses] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress>({ current: 0, total: 0 });
  const { storePromptResponse, storeFinalAssessment } = useSupabaseStorage();
  const { uploadAudio } = useAudioUpload();

  /**
   * Process all stored responses in batch at test completion
   */
  const processAllStoredResponses = async (
    storedResponses: StoredResponse[],
    sessionId: string,
    studentName?: string,
    setPromptHistory?: (history: { prompt: SpeakingPrompt; result: AssessmentResult }[]) => void
  ): Promise<AssessmentResult | null> => {
    console.log("Starting batch scoring of all stored responses:", storedResponses.length);
    setIsProcessingAllResponses(true);
    setProcessingProgress({ current: 0, total: storedResponses.length });
    
    try {
      const processedHistory: { prompt: SpeakingPrompt; result: AssessmentResult }[] = [];
      const allResults: AssessmentResult[] = [];
      
      // Process each response with full scoring pipeline
      for (const [index, response] of storedResponses.entries()) {
        try {
          console.log(`Batch processing response ${index + 1}/${storedResponses.length} for prompt:`, response.prompt.text.substring(0, 50));
          setProcessingProgress({ current: index + 1, total: storedResponses.length });
          
          // Now run full scoring for this response
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
          
          // Upload audio to storage and store individual response in database
          let audioPath: string | undefined = undefined;
          if (response.audioBlob) {
            const upload = await uploadAudio(response.audioBlob, sessionId);
            if (upload.path) {
              audioPath = upload.path;
            } else if (upload.error) {
              console.warn('Audio upload failed for this response:', upload.error);
            }
          }

          await storePromptResponse(
            sessionId,
            response.prompt,
            enhancedResult,
            index,
            response.transcript,
            audioPath
          );
          
          processedHistory.push({
            prompt: response.prompt,
            result: enhancedResult
          });
          
          allResults.push(enhancedResult);
          
        } catch (error) {
          console.error(`Error batch processing response ${index + 1}:`, error);
          // Continue with next response even if one fails
        }
      }
      
      // Calculate aggregated final result
      const aggregatedResult = await calculateAggregatedResult(allResults, sessionId, studentName);
      
      // Store final assessment result in database
      if (aggregatedResult) {
        await storeFinalAssessment(
          sessionId,
          aggregatedResult,
          { name: studentName },
          processedHistory
        );
      }
      
      // Update prompt history with processed results
      if (setPromptHistory) {
        setPromptHistory(processedHistory);
      }
      
      console.log("Batch processing completed. Final aggregated result:", aggregatedResult);
      return aggregatedResult;
      
    } catch (error) {
      console.error("Error in batch processing:", error);
      return null;
    } finally {
      setIsProcessingAllResponses(false);
      setProcessingProgress({ current: 0, total: 0 });
    }
  };

  return {
    isProcessingAllResponses,
    processingProgress,
    processAllStoredResponses
  };
};
