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
export const sessionService = {
  /**
   * Initialize a new assessment session
   */
  initializeSession: async (withEmail: boolean = false): Promise<SessionResponse> => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`https://rrslhxigqtfllunmowcy.supabase.co/functions/v1/assessment-manager/create-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionType: 'full_assessment',
          metadata: { emailResults: withEmail }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      return {
        success: true,
        sessionId: data.sessionId,
        data
      };
    } catch (error: any) {
      console.error('Failed to initialize session:', error);
      return {
        success: false,
        error: error.message || 'Failed to initialize session'
      };
    }
  },

  /**
   * Store assessment data for a session (finalize)
   */
  storeAssessmentData: async (sessionData: SessionData): Promise<SessionResponse> => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`https://rrslhxigqtfllunmowcy.supabase.co/functions/v1/assessment-manager/finalize-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          overallScores: sessionData.finalResult?.metrics || {},
          cefrLevel: sessionData.finalResult?.cefrLevel,
          studentInfo: sessionData.studentInfo
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to store assessment data');
      }

      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Failed to store assessment data:', error);
      return {
        success: false,
        error: error.message || 'Failed to store assessment data'
      };
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