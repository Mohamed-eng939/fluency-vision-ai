
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sessionService } from '@/services/sessionService';
import { useSupabaseStorage } from './useSupabaseStorage';
import { suggestedTrackForResult, trackLabel, TRACKS, type Track } from '@/data/assessment/tracks';

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

    // Record the age-based track with the result, and — if the student scored
    // above their track's ceiling (e.g. a teen above A2) — flag the track a
    // human assessor should consider moving them to. The system never moves a
    // student automatically; this is only a suggestion surfaced for review.
    const track: Track | undefined = studentInfo?.track;
    const cefr: string | undefined = finalResult?.cefrLevel;
    let enrichedStudentInfo = studentInfo;
    if (track) {
      const suggested = suggestedTrackForResult(track, cefr);
      enrichedStudentInfo = {
        ...studentInfo,
        track,
        suggestedTrack: suggested ?? undefined,
        placementNote: suggested
          ? `Scored ${cefr} on the ${trackLabel(track)} test, above its ${TRACKS[track].ceilingCefr} ceiling. A human assessor should consider placing this student in the ${trackLabel(suggested)} track.`
          : undefined,
      };
    }


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
      studentInfo: enrichedStudentInfo,
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
        enrichedStudentInfo,
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
      studentInfo: enrichedStudentInfo,
      promptHistory,
      finalResult,
      date: new Date().toISOString(),
      testType: 'quick',
      track: track ?? null,
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
