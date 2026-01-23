import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SpeakingPrompt, AssessmentResult } from '@/types/assessment';

/**
 * Hook to store individual assessment responses using the assessment-manager Edge Function
 */
export const useSupabaseStorageResponse = () => {
  const [isStoring, setIsStoring] = useState(false);

  /**
   * Store an individual prompt response
   */
  const storePromptResponse = async (
    sessionId: string,
    prompt: SpeakingPrompt,
    result: AssessmentResult,
    promptOrder: number,
    transcript?: string,
    audioUrl?: string
  ) => {
    console.log(`📝 [SupabaseStorage] Storing response for session ${sessionId}, order ${promptOrder}`);
    setIsStoring(true);
    
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        console.log('⚠️ [SupabaseStorage] No auth, using direct DB insert');
        return await storeResponseDirectly(sessionId, prompt, result, promptOrder, transcript, audioUrl);
      }

      // Try Edge Function first
      const { data, error } = await supabase.functions.invoke('assessment-manager', {
        body: {
          action: 'save-response',
          sessionId,
          promptId: crypto.randomUUID(), // Always generate a valid UUID
          promptIdentifier: prompt.id || `Q${promptOrder}`, // Store original ID separately
          promptOrder,
          userResponse: transcript || '',
          transcript,
          audioUrl,
          audioDuration: result.audioAnalysis?.totalDuration || 0,
          scores: {
            overall: result.metrics?.overall || 0,
            fluency: result.metrics?.fluency || 0,
            pronunciation: result.metrics?.pronunciation || 0,
            grammar: result.metrics?.grammar || 0,
            vocabulary: result.metrics?.vocabulary || 0,
            coherence: result.metrics?.coherence || 0,
            cefrLevel: result.cefrLevel || 'A1'
          },
          detailedFeedback: result.feedback || {},
          mistakesAnalysis: result.audioAnalysis || {},
          isFinal: false
        }
      });

      if (error) {
        console.log('🔄 [SupabaseStorage] Edge Function failed, using direct DB insert');
        return await storeResponseDirectly(sessionId, prompt, result, promptOrder, transcript, audioUrl);
      }

      console.log('✅ [SupabaseStorage] Response stored via Edge Function');
      return data;
    } catch (error) {
      console.error('❌ [SupabaseStorage] Error storing response:', error);
      console.log('🔄 [SupabaseStorage] Falling back to direct DB insert');
      return await storeResponseDirectly(sessionId, prompt, result, promptOrder, transcript, audioUrl);
    } finally {
      setIsStoring(false);
    }
  };

  /**
   * Store response directly in database (fallback)
   */
  const storeResponseDirectly = async (
    sessionId: string,
    prompt: SpeakingPrompt,
    result: AssessmentResult,
    promptOrder: number,
    transcript?: string,
    audioUrl?: string
  ) => {
    console.log(`💾 [SupabaseStorage] Storing response directly in DB`);
    
    try {
      const { data: response, error } = await supabase
        .from('assessment_responses')
        .insert({
          session_id: sessionId,
          prompt_id: crypto.randomUUID(), // Always generate a valid UUID
          prompt_identifier: prompt.id || `Q${promptOrder}`, // Store original ID separately
          prompt_order: promptOrder,
          user_response: transcript || '',
          transcript: transcript,
          audio_url: audioUrl,
          audio_duration: result.audioAnalysis?.totalDuration || 0,
          overall_score: result.metrics?.overall || 0,
          fluency_score: result.metrics?.fluency || 0,
          pronunciation_score: result.metrics?.pronunciation || 0,
          grammar_score: result.metrics?.grammar || 0,
          vocabulary_score: result.metrics?.vocabulary || 0,
          coherence_score: result.metrics?.coherence || 0,
          cefr_level: (result.cefrLevel || 'A1') as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
          detailed_feedback: result.feedback || {},
          mistakes_analysis: result.audioAnalysis || {},
          is_final: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [SupabaseStorage] Direct DB insert failed:', error);
        throw error;
      }

      console.log('✅ [SupabaseStorage] Response stored directly in DB');
      return { success: true, responseId: response.id, response };
    } catch (error) {
      console.error('💥 [SupabaseStorage] Direct storage failed:', error);
      throw error;
    }
  };

  /**
   * Store final assessment result
   */
  const storeFinalAssessment = async (
    sessionId: string,
    finalResult: AssessmentResult,
    studentInfo: any,
    promptHistory: any[]
  ) => {
    console.log(`🏆 [SupabaseStorage] Storing final assessment for session ${sessionId}`);
    
    try {
      const sessionData = {
        sessionId,
        studentInfo,
        promptHistory,
        finalResult
      };

      // Use the session service to finalize
      const { sessionService } = await import('@/services/sessionService');
      const result = await sessionService.storeAssessmentData(sessionData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to store final assessment');
      }

      console.log('✅ [SupabaseStorage] Final assessment stored successfully');
      return result;
    } catch (error) {
      console.error('❌ [SupabaseStorage] Failed to store final assessment:', error);
      throw error;
    }
  };

  return {
    storePromptResponse,
    storeFinalAssessment,
    isStoring
  };
};