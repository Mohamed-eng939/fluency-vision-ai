
import { useState } from 'react';
import { generateUniqueId } from '@/utils/assessmentUtils';

export const useSessionManagement = () => {
  // Track assessment session
  const [sessionId, setSessionId] = useState<string>('');
  const [emailResults, setEmailResults] = useState(false);
  
  // Initialize session
  const initializeSession = (withEmail: boolean = false) => {
    const newSessionId = generateUniqueId('QA');
    setSessionId(newSessionId);
    setEmailResults(withEmail);
    return newSessionId;
  };
  
  // Store assessment data
  const storeAssessmentData = (studentInfo: any, promptHistory: any[], finalResult: any) => {
    // In a real implementation, this would save to a database
    console.log('Storing assessment data', {
      sessionId,
      studentInfo,
      promptHistory,
      finalResult
    });
    
    // For now, we're just returning exportable data
    return {
      sessionId,
      studentInfo,
      promptHistory,
      finalResult,
      date: new Date().toISOString(),
      testType: 'quick'
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
    resetSession
  };
};
