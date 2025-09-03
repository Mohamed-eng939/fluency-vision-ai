import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentResult, SpeakingPrompt } from '@/types/assessment';

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
      
      // For now, just return true until database is fully integrated
      // This prevents the app from breaking during development
      console.log('Response stored successfully (mock)');
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

      // For now, just return true until database is fully integrated
      // This prevents the app from breaking during development
      console.log('Final assessment stored successfully (mock)');
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