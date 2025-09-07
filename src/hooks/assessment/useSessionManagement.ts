
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sessionService } from '@/services/sessionService';
import { useSupabaseStorage } from './useSupabaseStorage';

export const useSessionManagement = () => {
  // Track assessment session
  const [sessionId, setSessionId] = useState<string>('');
  const [emailResults, setEmailResults] = useState(false);
  const { storeFinalAssessment, isStoring } = useSupabaseStorage();
  
  // Initialize session
  const initializeSession = async (withEmail: boolean = false) => {
    console.log('🚀 [useSessionManagement] Starting session initialization with email:', withEmail);
    
    try {
      const response = await sessionService.initializeSession(withEmail);
      console.log('📡 [useSessionManagement] sessionService response:', response);
      
      if (response.success && response.sessionId) {
        console.log('✅ [useSessionManagement] Session created successfully:', response.sessionId);
        setSessionId(response.sessionId);
        setEmailResults(withEmail);
        return response.sessionId;
      } else {
        console.error('❌ [useSessionManagement] Failed to initialize session:', response.error);
        // Generate proper UUID fallback
        const fallbackId = crypto.randomUUID();
        setSessionId(fallbackId);
        setEmailResults(withEmail);
        return fallbackId;
      }
    } catch (error) {
      console.error('💥 [useSessionManagement] Exception during session initialization:', error);
      // Generate proper UUID fallback
      const fallbackId = crypto.randomUUID();
      setSessionId(fallbackId);
      setEmailResults(withEmail);
      return fallbackId;
    }
  };
  
  // Store assessment data
  const storeAssessmentData = async (studentInfo: any, promptHistory: any[], finalResult: any) => {
    // Use the sessionId from studentInfo if our sessionId is empty or invalid
    const effectiveSessionId = sessionId || studentInfo?.sessionId || crypto.randomUUID();
    
    console.log('💾 [useSessionManagement] Storing assessment data', {
      sessionId,
      effectiveSessionId,
      studentInfoSessionId: studentInfo?.sessionId,
      studentInfo,
      promptHistory,
      finalResult
    });
    
    // Update our internal sessionId if it was empty
    if (!sessionId && effectiveSessionId) {
      console.log('🔧 [useSessionManagement] Updating internal sessionId:', effectiveSessionId);
      setSessionId(effectiveSessionId);
    }
    
    // Store via Edge Function
    const response = await sessionService.storeAssessmentData({
      sessionId: effectiveSessionId,
      studentInfo,
      promptHistory,
      finalResult,
      emailResults
    });
    
    let success = response.success;
    
    // Fallback to direct database storage if Edge Function fails
    if (!success) {
      console.warn('⚠️ [useSessionManagement] Edge Function failed, falling back to direct storage:', response.error);
      success = await storeFinalAssessment(
        effectiveSessionId,
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
      sessionId: effectiveSessionId,
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
