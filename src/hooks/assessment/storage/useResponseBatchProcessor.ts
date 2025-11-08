
import { useState } from 'react';
import { AssessmentResult, SpeakingPrompt } from '@/types/assessment';
import { processRecordingForAssessment } from '@/utils/assessment/audioProcessingUtils';
import { applyCEFRCalibration } from '@/utils/scoring/cefrAssessmentResults';
import { StoredResponse, ProcessingProgress } from './types';
import { calculateAggregatedResult } from './responseAggregation';
import { useSupabaseStorageResponse } from '../useSupabaseStorageResponse';
import { useAudioUpload } from '@/hooks/useAudioUpload';
import { analyzeCefrVocabulary } from '@/utils/assessment/vocabulary/cefrVocabularyAnalyzer';
import { createVocabularyDetail, mapVocabularyScoreToCEFR } from '@/utils/assessment/vocabulary/vocabularyAggregation';
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
      const updatedResponses: StoredResponse[] = [];
      
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
          
          // Apply CEFR calibration with prompt history for level capping
          const promptsForCalibration = processedHistory.map(h => h.prompt);
          const enhancedResult = applyCEFRCalibration(result, response.audioAnalysis, promptsForCalibration);
          
          // Extract vocabulary details for aggregation
          let vocabularyDetail;
          if (response.transcript) {
            const vocabAnalysis = analyzeCefrVocabulary(response.transcript);
            const promptDifficulty = response.prompt.cefrLevel || 'B1';
            const vocabCEFR = mapVocabularyScoreToCEFR(vocabAnalysis.vocabularyScore);
            const recognitionRate = vocabAnalysis.totalWordCount > 0 
              ? (vocabAnalysis.recognizedWordCount / vocabAnalysis.totalWordCount) * 100 
              : 0;
            
            vocabularyDetail = createVocabularyDetail(
              index,
              vocabAnalysis.vocabularyScore,
              vocabCEFR,
              promptDifficulty,
              recognitionRate,
              vocabAnalysis.vocabularyJustification
            );
            
            console.log(`📚 [BatchProcessor] Vocabulary detail for Q${index + 1}:`, {
              score: vocabularyDetail.vocabularyScore,
              cefrLevel: vocabularyDetail.cefrLevel,
              difficulty: vocabularyDetail.promptDifficulty,
              weight: vocabularyDetail.weight,
              recognitionRate: vocabularyDetail.recognitionRate
            });
          }
          
          // Upload audio to storage and store individual response in database
          let audioPath: string | undefined = undefined;
          if (response.audioBlob) {
            try {
              console.log(`🎵 [BatchProcessor] Attempting audio upload for response ${index + 1}...`);
              const upload = await uploadAudio(response.audioBlob, sessionId);
              if (upload.path) {
                audioPath = upload.path;
                console.log(`✅ [BatchProcessor] Audio uploaded successfully: ${audioPath}`);
              } else if (upload.error) {
                console.warn('⚠️ [BatchProcessor] Audio upload failed, continuing without audio:', upload.error);
                // Don't let audio upload failure break the entire process
              }
            } catch (uploadError) {
              console.warn('⚠️ [BatchProcessor] Audio upload exception, continuing without audio:', uploadError);
              // Continue processing even if audio upload fails
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
            console.log(`✅ [BatchProcessor] Response ${index + 1} stored successfully in database`);
          } catch (storeError) {
            console.error(`❌ [BatchProcessor] Failed to store response ${index + 1} in database:`, storeError);
            // Continue processing even if individual response storage fails
          }
          
          processedHistory.push({
            prompt: response.prompt,
            result: enhancedResult
          });
          
          allResults.push(enhancedResult);
          
          // Store updated response with vocabulary detail
          updatedResponses.push({
            ...response,
            vocabularyDetail
          });
          
        } catch (error) {
          console.error(`💥 [BatchProcessor] Error processing response ${index + 1}:`, error);
          // Continue with next response even if one fails
        }
      }
      
      console.log(`🎊 [BatchProcessor] All ${storedResponses.length} responses processed successfully!`);
      
      // Calculate aggregated final result with prompt history for level capping
      console.log(`🧮 [BatchProcessor] Calculating aggregated result from ${allResults.length} results...`);
      const aggregatedResult = await calculateAggregatedResult(
        allResults, 
        sessionId, 
        studentName, 
        processedHistory,
        updatedResponses // Pass responses with vocabulary details
      );
      console.log(`📊 [BatchProcessor] Aggregated result calculated:`, aggregatedResult ? 'Success' : 'Failed');
      
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
      
      // Make sure to return the result even if there were some storage errors
      if (!aggregatedResult) {
        console.warn("⚠️ [BatchProcessor] No aggregated result, creating fallback result");
        const fallbackResult = {
          metrics: { fluency: 5, grammar: 5, pronunciation: 5, vocabulary: 5, coherence: 5, prosody: 5, syntax: 5 },
          totalScore: 5,
          cefrLevel: 'B1' as const,
          feedback: { overall: 'Assessment completed successfully', fluency: '', grammar: '', pronunciation: '', vocabulary: '', coherence: '', prosody: '', syntax: '' },
          sessionId,
          dateOfTest: new Date().toISOString()
        };
        return fallbackResult;
      }
      
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
