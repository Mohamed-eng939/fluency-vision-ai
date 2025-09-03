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
          session_id: sessionId,
          prompt_id: prompt.id,
          prompt_order: promptOrder,
          user_response: prompt.text || JSON.stringify(prompt),
          transcript: transcript || result.transcript,
          audio_url: audioUrl,
          overall_score: result.metrics.overall,
          fluency_score: result.metrics.fluency,
          grammar_score: result.metrics.grammar,
          pronunciation_score: result.metrics.pronunciation,
          vocabulary_score: result.metrics.vocabulary,
          coherence_score: result.metrics.syntax,
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
          session_id: sessionId,
          prompt_order: 0,
          user_response: `Final Assessment for ${studentInfo?.name || 'Anonymous'}`,
          transcript: promptHistory.map(h => h.result?.transcript).filter(Boolean).join(' '),
          overall_score: finalResult.metrics.overall,
          fluency_score: finalResult.metrics.fluency,
          grammar_score: finalResult.metrics.grammar,
          pronunciation_score: finalResult.metrics.pronunciation,
          vocabulary_score: finalResult.metrics.vocabulary,
          coherence_score: finalResult.metrics.syntax,
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