import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentResult, SpeakingPrompt } from '@/types/assessment';

export const useSupabaseStorage = () => {
  const [isStoring, setIsStoring] = useState(false);

  // Store individual response in responses table  
  const storePromptResponse = async (
    sessionId: string,
    prompt: SpeakingPrompt,
    result: AssessmentResult,
    promptOrder: number,
    transcript?: string,
    audioUrl?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('responses')
        .insert({
          assessment_id: sessionId,
          prompt_text: prompt.text || JSON.stringify(prompt),
          transcript: transcript || result.transcript,
          audio_url: audioUrl,
          scores: {
            fluency: result.metrics.fluency,
            grammar: result.metrics.grammar,
            pronunciation: result.metrics.pronunciation,
            vocabulary: result.metrics.vocabulary,
            syntax: result.metrics.syntax,
            coherence: result.metrics.coherence,
            prosody: result.metrics.prosody,
            total_score: result.totalScore,
            cefr_level: result.cefrLevel,
            prompt_order: promptOrder
          },
          is_final: false
        });

      if (error) {
        console.error('Error storing prompt response:', error);
        return false;
      }

      console.log('Stored prompt response:', data);
      return true;
    } catch (error) {
      console.error('Error storing prompt response:', error);
      return false;
    }
  };

  // Store final assessment result
  const storeFinalAssessment = async (
    sessionId: string,
    finalResult: AssessmentResult,
    studentInfo: any,
    promptHistory: any[]
  ) => {
    try {
      setIsStoring(true);

      // Store final aggregated result
      const { data, error } = await supabase
        .from('responses')
        .insert({
          assessment_id: sessionId,
          prompt_text: `Final Assessment for ${studentInfo?.name || 'Anonymous'}`,
          transcript: promptHistory.map(h => h.result?.transcript).filter(Boolean).join(' '),
          scores: {
            fluency: finalResult.metrics.fluency,
            grammar: finalResult.metrics.grammar,
            pronunciation: finalResult.metrics.pronunciation,
            vocabulary: finalResult.metrics.vocabulary,
            syntax: finalResult.metrics.syntax,
            coherence: finalResult.metrics.coherence,
            prosody: finalResult.metrics.prosody,
            total_score: finalResult.totalScore,
            cefr_level: finalResult.cefrLevel,
            student_info: studentInfo,
            total_prompts: promptHistory.length,
            assessment_type: finalResult.assessmentType || 'quick'
          },
          is_final: true,
          reviewer_notes: `Assessment completed with ${promptHistory.length} responses. Final CEFR level: ${finalResult.cefrLevel}`
        });

      if (error) {
        console.error('Error storing final assessment:', error);
        return false;
      }

      console.log('Stored final assessment:', data);
      return true;
    } catch (error) {
      console.error('Error storing final assessment:', error);
      return false;
    } finally {
      setIsStoring(false);
    }
  };

  return {
    isStoring,
    storePromptResponse,
    storeFinalAssessment
  };
};