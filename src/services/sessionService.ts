import { supabase } from '@/integrations/supabase/client';

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
 * Session Service - Handle all session-related operations via Edge Functions
 */
export const sessionService = {
  /**
   * Initialize a new assessment session
   */
  initializeSession: async (withEmail: boolean = false): Promise<SessionResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: {
          action: 'initialize',
          emailResults: withEmail
        }
      });

      if (error) throw error;

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
   * Store assessment data for a session
   */
  storeAssessmentData: async (sessionData: SessionData): Promise<SessionResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: {
          action: 'store',
          ...sessionData
        }
      });

      if (error) throw error;

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
      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: {
          action: 'get',
          sessionId
        }
      });

      if (error) throw error;

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
      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: {
          action: 'update_status',
          sessionId,
          status
        }
      });

      if (error) throw error;

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