import { supabase, SUPABASE_PROJECT_URL } from '@/integrations/supabase/client';
import { normalizeCEFRForDatabase } from '@/utils/cefrNormalization';

export interface SessionData {
  sessionId: string;
  studentInfo?: any;
  promptHistory?: any[];
  finalResult?: any;
  emailResults?: boolean;
}

export interface SessionResponse {
  success: boolean;
  sessionId?: string;
  data?: any;
  error?: string;
}

/**
 * Session Service - Handle all session-related operations via Assessment Manager Edge Function
 */
// Ensure the browser has a real auth identity (signing in anonymously if needed)
// before touching session data, so RLS policies scoped by user_id = auth.uid()
// cover guest test-takers too instead of relying on a shared NULL user_id.
export async function ensureAuthSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (session?.user) {
    return { session, error: null as any };
  }

  console.log('🔑 [sessionService] No auth session, signing in anonymously');
  const { data, error: anonError } = await supabase.auth.signInAnonymously();
  if (anonError) {
    console.error('❌ [sessionService] Anonymous sign-in failed:', anonError);
    return { session: null, error: anonError };
  }

  return { session: data.session, error: null as any };
}

// Helper function to finalize anonymous session
async function finalizeAnonymousSession(sessionData: SessionData): Promise<SessionResponse> {
  console.log('🔄 [sessionService] Finalizing anonymous session directly in DB');
  console.log('🔄 [sessionService] Using sessionId:', sessionData.sessionId);
  
  // Use sessionId from sessionData or from studentInfo as fallback
  const effectiveSessionId = sessionData.sessionId || sessionData.studentInfo?.sessionId;
  
  if (!effectiveSessionId) {
    console.error('❌ [sessionService] No valid session ID found for anonymous finalization');
    return {
      success: false,
      error: 'No valid session ID found'
    };
  }
  
  try {
    // For anonymous users, just try to update any existing session or create a new one
    const { data: session, error } = await supabase
      .from('assessment_sessions')
      .upsert({
        id: effectiveSessionId,
        user_id: null, // Always null for anonymous sessions
        session_type: 'full_assessment',
        status: 'completed',
        overall_score: sessionData.finalResult?.metrics?.overall || 0,
        fluency_score: sessionData.finalResult?.metrics?.fluency || 0,
        pronunciation_score: sessionData.finalResult?.metrics?.pronunciation || 0,
        grammar_score: sessionData.finalResult?.metrics?.grammar || 0,
        vocabulary_score: sessionData.finalResult?.metrics?.vocabulary || 0,
        coherence_score: sessionData.finalResult?.metrics?.coherence || 0,
        overall_cefr_level: normalizeCEFRForDatabase(sessionData.finalResult?.cefrLevel || 'A1'),
        student_info: sessionData.studentInfo,
        metadata: { anonymous: true, created_during_finalization: true }
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [sessionService] Anonymous session upsert failed:', error);
      throw new Error('Failed to finalize anonymous session');
    }

    console.log('✅ [sessionService] Anonymous session finalized successfully');
    return {
      success: true,
      data: { session }
    };
  } catch (error: any) {
    console.error('💥 [sessionService] Anonymous finalization error:', error);
    return {
      success: false,
      error: error.message || 'Failed to finalize session'
    };
  }
}

// Helper function to create anonymous session
async function createAnonymousSession(withEmail: boolean): Promise<SessionResponse> {
  console.log('🔄 [sessionService] Creating anonymous session fallback');
  
  try {
    // Create session directly in database for anonymous users
    const { data: session, error } = await supabase
      .from('assessment_sessions')
      .insert({
        user_id: null, // Anonymous sessions have no user
        session_type: 'full_assessment',
        metadata: { emailResults: withEmail, anonymous: true },
        status: 'in_progress'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [sessionService] Anonymous session creation failed:', error);
      throw new Error('Failed to create anonymous session');
    }

    console.log('✅ [sessionService] Anonymous session created:', session.id);
    return {
      success: true,
      sessionId: session.id,
      data: { session }
    };
  } catch (error: any) {
    console.error('💥 [sessionService] Anonymous session fallback failed:', error);
    // Last resort - return a client-side session ID
    const fallbackId = crypto.randomUUID();
    return {
      success: true,
      sessionId: fallbackId,
      data: { fallback: true }
    };
  }
}

export const sessionService = {
  /**
   * Initialize a new assessment session
   */
  initializeSession: async (withEmail: boolean = false): Promise<SessionResponse> => {
    console.log('🚀 [sessionService] Starting session initialization with email:', withEmail);
    
    try {
      // Check authentication first, signing in anonymously if needed so guest
      // test-takers get a real auth.uid() and are covered by standard RLS.
      const { session, error: authError } = await ensureAuthSession();
      console.log('🔐 [sessionService] Auth session:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        authError: authError?.message
      });

      if (authError || !session?.user) {
        console.log('⚠️ [sessionService] Anonymous sign-in failed, creating anonymous session');
        // Last-resort fallback only — anonymous sign-in itself failed
        return await createAnonymousSession(withEmail);
      }

      // Use Supabase client function invoke
      console.log('📡 [sessionService] Calling assessment-manager Edge Function with user:', session.user.id);
      const { data, error } = await supabase.functions.invoke('assessment-manager', {
        body: {
          action: 'create-session',
          sessionType: 'full_assessment',
          metadata: { emailResults: withEmail }
        }
      });

      console.log('📡 [sessionService] Edge Function response:', { data, error, status: data?.status });
      
      if (error) {
        console.log('🔄 [sessionService] Edge Function error, falling back to anonymous session:', error);
        return await createAnonymousSession(withEmail);
      }

      if (!data?.success) {
        console.log('🔄 [sessionService] Edge Function unsuccessful, falling back to anonymous session:', data?.error);
        return await createAnonymousSession(withEmail);
      }

      console.log('✅ [sessionService] Session created successfully via Edge Function:', data.sessionId);
      return {
        success: true,
        sessionId: data.sessionId,
        data
      };
    } catch (error: any) {
      console.error('❌ [sessionService] Session initialization failed:', error);
      console.log('🔄 [sessionService] Falling back to anonymous session...');
      
      // Fallback to anonymous session
      return await createAnonymousSession(withEmail);
    }
  },

  /**
   * Store assessment data for a session (finalize)
   */
  storeAssessmentData: async (sessionData: SessionData): Promise<SessionResponse> => {
    console.log('💾 [sessionService] Starting assessment data storage for session:', sessionData.sessionId);
    console.log('💾 [sessionService] Final result metrics:', sessionData.finalResult?.metrics);
    console.log('💾 [sessionService] Student info:', sessionData.studentInfo);
    
    try {
      const { session, error: authError } = await ensureAuthSession();

      if (authError || !session?.user) {
        console.log('⚠️ [sessionService] Anonymous sign-in failed, finalizing as anonymous session');
        return await finalizeAnonymousSession(sessionData);
      }

      console.log('🔐 [sessionService] Authenticated user found:', session.user.id);
      
      // For authenticated users, finalize directly in database
      // Add user_id to sessionData for proper finalization
      const authenticatedSessionData = {
        ...sessionData,
        studentInfo: {
          ...sessionData.studentInfo,
          userId: session.user.id
        }
      };

      const { data: updatedSession, error } = await supabase
        .from('assessment_sessions')
        .update({
          status: 'completed',
          overall_score: sessionData.finalResult?.metrics?.overall || 0,
          fluency_score: sessionData.finalResult?.metrics?.fluency || 0,
          pronunciation_score: sessionData.finalResult?.metrics?.pronunciation || 0,
          grammar_score: sessionData.finalResult?.metrics?.grammar || 0,
          vocabulary_score: sessionData.finalResult?.metrics?.vocabulary || 0,
          coherence_score: sessionData.finalResult?.metrics?.coherence || 0,
          overall_cefr_level: normalizeCEFRForDatabase(sessionData.finalResult?.cefrLevel || 'A1'),
          student_info: authenticatedSessionData.studentInfo
        })
        .eq('id', sessionData.sessionId)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.log('⚠️ [sessionService] Session update failed, trying to create session:', error);
        
        // If update fails, try to create the session for authenticated user
        const { data: newSession, error: createError } = await supabase
          .from('assessment_sessions')
          .insert({
            id: sessionData.sessionId,
            user_id: session.user.id,
            session_type: 'full_assessment',
            status: 'completed',
            overall_score: sessionData.finalResult?.metrics?.overall || 0,
            fluency_score: sessionData.finalResult?.metrics?.fluency || 0,
            pronunciation_score: sessionData.finalResult?.metrics?.pronunciation || 0,
            grammar_score: sessionData.finalResult?.metrics?.grammar || 0,
            vocabulary_score: sessionData.finalResult?.metrics?.vocabulary || 0,
            coherence_score: sessionData.finalResult?.metrics?.coherence || 0,
            overall_cefr_level: normalizeCEFRForDatabase(sessionData.finalResult?.cefrLevel || 'A1'),
            student_info: authenticatedSessionData.studentInfo,
            metadata: { created_during_finalization: true }
          })
          .select()
          .single();
          
        if (createError) {
          console.error('❌ [sessionService] Authenticated session creation failed:', createError);
          throw new Error('Failed to create authenticated session');
        }
        
        console.log('✅ [sessionService] Created new authenticated session successfully');
        return {
          success: true,
          data: { session: newSession }
        };
      }

      console.log('✅ [sessionService] Authenticated session finalized successfully');
      return {
        success: true,
        data: { session: updatedSession }
      };
    } catch (error: any) {
      console.error('❌ [sessionService] Assessment finalization failed:', error);
      console.log('🔄 [sessionService] Falling back to anonymous finalization...');
      return await finalizeAnonymousSession(sessionData);
    }
  },

  /**
   * Get session data
   */
  getSession: async (sessionId: string): Promise<SessionResponse> => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/assessment-manager/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get session');
      }

      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Failed to get session:', error);
      return {
        success: false,
        error: error.message || 'Failed to get session'
      };
    }
  },

  /**
   * Update session status
   */
  updateSessionStatus: async (sessionId: string, status: string): Promise<SessionResponse> => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/assessment-manager/session/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update session status');
      }

      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Failed to update session status:', error);
      return {
        success: false,
        error: error.message || 'Failed to update session status'
      };
    }
  }
};