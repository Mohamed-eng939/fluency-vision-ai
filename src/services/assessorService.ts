import { supabase } from '@/integrations/supabase/client';

export interface PendingAssessment {
  id: string;
  user_id: string;
  session_type: string;
  status: string;
  overall_score: number;
  overall_cefr_level: string;
  created_at: string;
  student_info: {
    name: string;
    email: string;
  };
  profiles: {
    full_name: string;
    email: string;
    first_language: string;
    country_of_residence: string;
  };
}

export interface AssessorServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Assessor Service - Handle assessor-specific operations
 * All operations require authenticated user with assessor/admin role
 */
export const assessorService = {
  /**
   * Get pending assessments for review
   * Requires authenticated user with assessor or admin role
   */
  getPendingAssessments: async (): Promise<AssessorServiceResponse> => {
    try {
      console.log('🔍 [assessorService] Fetching pending assessments...');
      
      // Verify user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ [assessorService] Not authenticated');
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Call the assessor-manager edge function for secure access
      const { data, error } = await supabase.functions.invoke('assessor-manager/pending-assessments', {
        method: 'GET'
      });

      if (error) {
        console.error('❌ [assessorService] Edge function error:', error);
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch pending assessments');
      }

      console.log('✅ [assessorService] Got pending assessments:', data.data?.length);
      return {
        success: true,
        data: data.data || []
      };
    } catch (error: any) {
      console.error('❌ [assessorService] Failed to get pending assessments:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch pending assessments'
      };
    }
  },

  /**
   * Assign an assessment to current assessor
   * Requires authenticated user with assessor or admin role
   */
  assignAssessment: async (sessionId: string): Promise<AssessorServiceResponse> => {
    try {
      console.log('📝 [assessorService] Assigning assessment:', sessionId);
      
      // Verify user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ [assessorService] Not authenticated');
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Call the assessor-manager edge function for secure assignment
      const { data, error } = await supabase.functions.invoke('assessor-manager/assign-assessment', {
        method: 'POST',
        body: { 
          sessionId,
          assessorId: user.id // Use authenticated user's ID
        }
      });

      if (error) {
        console.error('❌ [assessorService] Edge function error:', error);
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to assign assessment');
      }

      console.log('✅ [assessorService] Assessment assigned successfully');
      return {
        success: true,
        data: data.data
      };
    } catch (error: any) {
      console.error('❌ [assessorService] Failed to assign assessment:', error);
      return {
        success: false,
        error: error.message || 'Failed to assign assessment'
      };
    }
  },

  /**
   * Get assessment details for review
   * Requires authenticated user with access to the session
   */
  getAssessmentDetails: async (sessionId: string): Promise<AssessorServiceResponse> => {
    try {
      console.log('🔍 [assessorService] Fetching assessment details:', sessionId);

      // Verify user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ [assessorService] Not authenticated');
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Get session details (RLS will enforce access control)
      const { data: sessionData, error: sessionError } = await supabase
        .from('assessment_sessions')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            first_language,
            country_of_residence
          )
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      // Get responses from database (RLS will enforce access control)
      const { data: responses, error: responsesError } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('session_id', sessionId)
        .order('prompt_order');

      if (responsesError) {
        console.error('Error fetching responses:', responsesError);
      }

      let finalResponses = responses || [];

      // If no responses in database, try to reconstruct from storage
      if (!finalResponses || finalResponses.length === 0) {
        console.log('📂 [assessorService] No DB responses, checking storage for audio files...');
        try {
          const { data: storageData, error: storageError } = await supabase.functions.invoke(
            'get-session-audio-files',
            { body: { sessionId } }
          );

          if (!storageError && storageData?.responses) {
            console.log(`✅ [assessorService] Reconstructed ${storageData.responses.length} responses from storage`);
            finalResponses = storageData.responses;
          }
        } catch (storageErr) {
          console.warn('⚠️ [assessorService] Could not reconstruct from storage:', storageErr);
        }
      }

      console.log('✅ [assessorService] Got assessment details');
      return {
        success: true,
        data: {
          session: sessionData,
          responses: finalResponses
        }
      };
    } catch (error: any) {
      console.error('❌ [assessorService] Failed to get assessment details:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch assessment details'
      };
    }
  }
};
