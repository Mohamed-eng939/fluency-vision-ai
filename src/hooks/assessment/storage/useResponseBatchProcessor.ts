
import { useState } from 'react';
import { AssessmentResult, SpeakingPrompt } from '@/types/assessment';
import { processRecordingForAssessment } from '@/utils/assessment/audioProcessingUtils';
import { applyCEFRCalibration } from '@/utils/scoring/cefrAssessmentResults';
import { StoredResponse, ProcessingProgress } from './types';
import { calculateAggregatedResult } from './responseAggregation';
import { useSupabaseStorageResponse } from '../useSupabaseStorageResponse';
import { useAudioUpload } from '@/hooks/useAudioUpload';
export const useResponseBatchProcessor = () => {
  const [isProcessingAllResponses, setIsProcessingAllResponses] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress>({ current: 0, total: 0 });
  const { storePromptResponse, storeFinalAssessment } = useSupabaseStorageResponse();
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
    console.log("🎯 [BatchProcessor] Starting batch scoring of all stored responses:", storedResponses.length);
    setIsProcessingAllResponses(true);
    setProcessingProgress({ current: 0, total: storedResponses.length });
    
    try {
      const processedHistory: { prompt: SpeakingPrompt; result: AssessmentResult }[] = [];
      const allResults: AssessmentResult[] = [];
      
      // Process each response with full scoring pipeline
      for (const [index, response] of storedResponses.entries()) {
        try {
          console.log(`📊 [BatchProcessor] Processing response ${index + 1}/${storedResponses.length} for:`, response.prompt.text.substring(0, 50));
          setProcessingProgress({ current: index + 1, total: storedResponses.length });
          
          // Run full scoring for this response
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
            try {
              const upload = await uploadAudio(response.audioBlob, sessionId);
              if (upload.path) {
                audioPath = upload.path;
                console.log(`🎵 [BatchProcessor] Audio uploaded successfully: ${audioPath}`);
              } else if (upload.error) {
                console.warn('⚠️ [BatchProcessor] Audio upload failed:', upload.error);
              }
            } catch (uploadError) {
              console.warn('⚠️ [BatchProcessor] Audio upload exception:', uploadError);
            }
          }

          // Store individual response using assessment-manager Edge Function
          try {
            console.log(`💾 [BatchProcessor] Storing response ${index + 1} in database...`);
            await storePromptResponse(
              sessionId,
              response.prompt,
              enhancedResult,
              index,
              response.transcript,
              audioPath
            );
            console.log(`✅ [BatchProcessor] Response ${index + 1} stored successfully`);
          } catch (storeError) {
            console.error(`❌ [BatchProcessor] Failed to store response ${index + 1}:`, storeError);
            // Continue processing even if storage fails
          }
          
          processedHistory.push({
            prompt: response.prompt,
            result: enhancedResult
          });
          
          allResults.push(enhancedResult);
          
        } catch (error) {
          console.error(`💥 [BatchProcessor] Error processing response ${index + 1}:`, error);
          // Continue with next response even if one fails
        }
      }
      
      console.log(`🎊 [BatchProcessor] All responses processed. Calculating final result...`);
      
      // Calculate aggregated final result
      const aggregatedResult = await calculateAggregatedResult(allResults, sessionId, studentName);
      
      // Store final assessment result in database
      if (aggregatedResult) {
        try {
          console.log(`🏆 [BatchProcessor] Storing final assessment result...`);
          await storeFinalAssessment(
            sessionId,
            aggregatedResult,
            { name: studentName },
            processedHistory
          );
          console.log(`✅ [BatchProcessor] Final assessment stored successfully`);
        } catch (finalStoreError) {
          console.error(`❌ [BatchProcessor] Failed to store final assessment:`, finalStoreError);
        }
      }
      
      // Update prompt history with processed results
      if (setPromptHistory) {
        console.log(`📝 [BatchProcessor] Updating prompt history with ${processedHistory.length} entries`);
        setPromptHistory(processedHistory);
      } else {
        console.log(`📝 [BatchProcessor] No setPromptHistory callback provided`);
      }
      
      console.log("🎉 [BatchProcessor] Batch processing completed successfully!");
      console.log("📈 [BatchProcessor] Final aggregated result:", aggregatedResult);
      return aggregatedResult;
      
    } catch (error) {
      console.error("💥 [BatchProcessor] Critical error in batch processing:", error);
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
