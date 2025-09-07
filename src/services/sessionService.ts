import { supabase } from '@/lib/supabase/client';

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
// Helper function to finalize anonymous session
async function finalizeAnonymousSession(sessionData: SessionData): Promise<SessionResponse> {
  console.log('🔄 [sessionService] Finalizing anonymous session directly in DB');
  
  try {
    const { data: session, error } = await supabase
      .from('assessment_sessions')
      .update({
        status: 'completed',
        overall_score: sessionData.finalResult?.metrics?.overall || 0,
        fluency_score: sessionData.finalResult?.metrics?.fluency || 0,
        pronunciation_score: sessionData.finalResult?.metrics?.pronunciation || 0,
        grammar_score: sessionData.finalResult?.metrics?.grammar || 0,
        vocabulary_score: sessionData.finalResult?.metrics?.vocabulary || 0,
        coherence_score: sessionData.finalResult?.metrics?.coherence || 0,
        overall_cefr_level: sessionData.finalResult?.cefrLevel || 'A1',
        student_info: sessionData.studentInfo
      })
      .eq('id', sessionData.sessionId)
      .select()
      .single();

    if (error) {
      console.error('❌ [sessionService] Anonymous finalization failed:', error);
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
    const sessionId = crypto.randomUUID();
    
    const { data: session, error } = await supabase
      .from('assessment_sessions')
      .insert({
        id: sessionId,
        user_id: sessionId, // Use session ID as anonymous user ID
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

    console.log('✅ [sessionService] Anonymous session created:', sessionId);
    return {
      success: true,
      sessionId: sessionId,
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
      // Check authentication first
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      console.log('🔐 [sessionService] Auth session:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userId: session?.user?.id,
        authError: authError?.message 
      });
      
      if (authError || !session?.user) {
        console.log('⚠️ [sessionService] No authenticated user, creating anonymous session');
        // For anonymous users, create session without auth
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
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        console.log('⚠️ [sessionService] No auth for finalization, using direct DB update');
        return await finalizeAnonymousSession(sessionData);
      }

      // Use Supabase client function invoke
      console.log('📡 [sessionService] Calling finalize-session Edge Function with user:', session.user.id);
      const { data, error } = await supabase.functions.invoke('assessment-manager', {
        body: {
          action: 'finalize-session',
          sessionId: sessionData.sessionId,
          overallScores: sessionData.finalResult?.metrics || {},
          cefrLevel: sessionData.finalResult?.cefrLevel,
          studentInfo: sessionData.studentInfo
        }
      });

      console.log('📡 [sessionService] Finalization response:', { data, error, success: data?.success });
      
      if (error) {
        console.log('🔄 [sessionService] Edge Function failed, falling back to direct DB...', error);
        return await finalizeAnonymousSession(sessionData);
      }

      if (!data?.success) {
        console.log('🔄 [sessionService] Edge Function unsuccessful, falling back to direct DB:', data?.error);
        return await finalizeAnonymousSession(sessionData);
      }

      console.log('✅ [sessionService] Assessment finalized successfully via Edge Function');
      return {
        success: true,
        data
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

      const response = await fetch(`https://rrslhxigqtfllunmowcy.supabase.co/functions/v1/assessment-manager/session/${sessionId}`, {
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

      const response = await fetch(`https://rrslhxigqtfllunmowcy.supabase.co/functions/v1/assessment-manager/session/${sessionId}`, {
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