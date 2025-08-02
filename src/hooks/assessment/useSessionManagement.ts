
import { useState } from 'react';
import { sessionService } from '@/services/sessionService';
import { useSupabaseStorage } from './useSupabaseStorage';

export const useSessionManagement = () => {
  // Track assessment session
  const [sessionId, setSessionId] = useState<string>('');
  const [emailResults, setEmailResults] = useState(false);
  const { storeFinalAssessment, isStoring } = useSupabaseStorage();
  
  // Initialize session
  const initializeSession = async (withEmail: boolean = false) => {
    const response = await sessionService.initializeSession(withEmail);
    
    if (response.success && response.sessionId) {
      setSessionId(response.sessionId);
      setEmailResults(withEmail);
      return response.sessionId;
    } else {
      console.error('Failed to initialize session:', response.error);
      // Fallback to local session ID generation
      const fallbackId = `QA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(fallbackId);
      setEmailResults(withEmail);
      return fallbackId;
    }
  };
  
  // Store assessment data
  const storeAssessmentData = async (studentInfo: any, promptHistory: any[], finalResult: any) => {
    console.log('Storing assessment data via session-manager', {
      sessionId,
      studentInfo,
      promptHistory,
      finalResult
    });
    
    // Store via Edge Function
    const response = await sessionService.storeAssessmentData({
      sessionId,
      studentInfo,
      promptHistory,
      finalResult,
      emailResults
    });
    
    let success = response.success;
    
    // Fallback to direct database storage if Edge Function fails
    if (!success) {
      console.warn('Edge Function failed, falling back to direct storage:', response.error);
      success = await storeFinalAssessment(
        sessionId,
        finalResult,
        studentInfo,
        promptHistory
      );
    }
    
    if (success) {
      console.log('✅ Assessment data stored successfully');
    } else {
      console.error('❌ Failed to store assessment data');
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
