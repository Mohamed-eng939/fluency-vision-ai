import { useState } from 'react';
import { supabase, SUPABASE_PROJECT_URL } from '@/integrations/supabase/client';
import { AssessmentResult, SpeakingPrompt } from '@/types/assessment';
import { normalizeCEFRForDatabase } from '@/utils/cefrNormalization';

export const useSupabaseStorage = () => {
  const [isStoring, setIsStoring] = useState(false);

  const storePromptResponse = async (
    sessionId: string,
    prompt: SpeakingPrompt,
    result: AssessmentResult,
    promptOrder: number,
    transcript?: string,
    audioUrl?: string
  ) => {
    try {
      console.log('Storing prompt response for session:', sessionId);
      
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/assessment-manager/save-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          promptId: prompt.id || crypto.randomUUID(),
          promptOrder,
          userResponse: result.transcript,
          transcript,
          audioUrl,
          audioDuration: result.duration,
          // Persist the REAL per-criterion scores so the assessor / accessed
          // report matches what the learner saw. Previously these were hardcoded
          // to 0, which is why grammar/fluency/vocabulary showed 0 (or N/A) on
          // review and poisoned the training data. null = genuinely unmeasured.
          scores: {
            overall: result.totalScore ?? null,
            fluency: result.metrics?.fluency ?? null,
            grammar: result.metrics?.grammar ?? null,
            vocabulary: result.metrics?.vocabulary ?? null,
            cefrLevel: result.cefrLevel
          },
          detailedFeedback: {
            ...result.feedback,
            grammarApiAnalysis: result.audioAnalysis?.grammarApiAnalysis,
            fluencyApiAnalysis: result.audioAnalysis?.fluencyApiAnalysis,
            cefrVocabularyLevel: result.audioAnalysis?.cefrVocabularyLevel,
            vocabularyDistribution: result.audioAnalysis?.vocabularyDistribution,
            vocabularyJustification: result.audioAnalysis?.vocabularyJustification,
          },
          mistakesAnalysis: {
            grammarApiAnalysis: result.audioAnalysis?.grammarApiAnalysis,
            fluencyApiAnalysis: result.audioAnalysis?.fluencyApiAnalysis,
            cefrVocabularyLevel: result.audioAnalysis?.cefrVocabularyLevel,
            vocabularyDistribution: result.audioAnalysis?.vocabularyDistribution,
          },
          isFinal: false
        })

      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to store response');
      }

      console.log('Response stored successfully:', data);
      return true;
    } catch (error) {
      console.error('Error storing prompt response:', error);
      return false;
    }
  };

  const storeFinalAssessment = async (
    sessionId: string,
    finalResult: AssessmentResult,
    studentInfo: any,
    promptHistory: any[]
  ) => {
    try {
      setIsStoring(true);
      console.log('Storing final assessment for session:', sessionId);

      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/assessment-manager/finalize-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          overallScores: {
            overall: finalResult.metrics.overall || finalResult.totalScore,
            fluency: finalResult.metrics.fluency,
            pronunciation: finalResult.metrics.pronunciation,
            grammar: finalResult.metrics.grammar,
            vocabulary: finalResult.metrics.vocabulary,
            coherence: finalResult.metrics.coherence
          },
          cefrLevel: normalizeCEFRForDatabase(finalResult.cefrLevel),
          studentInfo
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to store final assessment');
      }

      console.log('Final assessment stored successfully:', data);
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