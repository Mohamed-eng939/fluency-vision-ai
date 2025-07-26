
import { useState } from 'react';
import { generateUniqueId } from '@/utils/assessmentUtils';
import { useSupabaseStorage } from './useSupabaseStorage';

export const useSessionManagement = () => {
  // Track assessment session
  const [sessionId, setSessionId] = useState<string>('');
  const [emailResults, setEmailResults] = useState(false);
  const { storeFinalAssessment, isStoring } = useSupabaseStorage();
  
  // Initialize session
  const initializeSession = (withEmail: boolean = false) => {
    const newSessionId = generateUniqueId('QA');
    setSessionId(newSessionId);
    setEmailResults(withEmail);
    return newSessionId;
  };
  
  // Store assessment data
  const storeAssessmentData = async (studentInfo: any, promptHistory: any[], finalResult: any) => {
    console.log('Storing assessment data to Supabase', {
      sessionId,
      studentInfo,
      promptHistory,
      finalResult
    });
    
    // Store in Supabase database
    const success = await storeFinalAssessment(
      sessionId,
      finalResult,
      studentInfo,
      promptHistory
    );
    
    if (success) {
      console.log('✅ Assessment data stored successfully in Supabase');
    } else {
      console.error('❌ Failed to store assessment data in Supabase');
    }
    
    // Return exportable data for UI usage
    return {
      sessionId,
      studentInfo,
      promptHistory,
      finalResult,
      date: new Date().toISOString(),
      testType: 'quick',
      stored: success
    };
  };
  
  // Reset session
  const resetSession = () => {
    setSessionId('');
    setEmailResults(false);
  };
  
  return {
    sessionId,
    emailResults,
    initializeSession,
    storeAssessmentData,
    resetSession,
    isStoring
  };
};
