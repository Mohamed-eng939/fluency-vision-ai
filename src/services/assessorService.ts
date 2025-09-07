import { supabase } from '@/lib/supabase/client';

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
 */
export const assessorService = {
  /**
   * Get pending assessments for review
   */
  getPendingAssessments: async (): Promise<AssessorServiceResponse> => {
    try {
      console.log('🔍 [assessorService] Fetching pending assessments...');
      
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        console.log('⚠️ [assessorService] No authenticated user');
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Try Edge Function first
      try {
        const { data, error } = await supabase.functions.invoke('assessment-manager', {
          method: 'GET',
          body: null,
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        console.log('✅ [assessorService] Got pending assessments via Edge Function:', data);
        return {
          success: true,
          data: data.sessions || []
        };
      } catch (edgeError) {
        console.log('🔄 [assessorService] Edge Function failed, trying direct DB...');
        
        // Fallback to direct database query
        const { data: sessions, error: dbError } = await supabase
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
          .eq('status', 'completed')
          .is('assigned_assessor', null)
          .order('created_at', { ascending: false });

        if (dbError) {
          throw new Error(dbError.message);
        }

        console.log('✅ [assessorService] Got pending assessments via direct DB:', sessions);
        return {
          success: true,
          data: sessions || []
        };
      }
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
   */
  assignAssessment: async (sessionId: string): Promise<AssessorServiceResponse> => {
    try {
      console.log('📝 [assessorService] Assigning assessment:', sessionId);
      
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const { data, error } = await supabase
        .from('assessment_sessions')
        .update({
          assigned_assessor: session.user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('status', 'completed')
        .is('assigned_assessor', null)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ [assessorService] Assessment assigned successfully');
      return {
        success: true,
        data
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
   */
  getAssessmentDetails: async (sessionId: string): Promise<AssessorServiceResponse> => {
    try {
      console.log('🔍 [assessorService] Fetching assessment details:', sessionId);
      
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Get session details
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

      // Get responses
      const { data: responses, error: responsesError } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('session_id', sessionId)
        .order('prompt_order');

      if (responsesError) {
        console.error('Error fetching responses:', responsesError);
      }

      console.log('✅ [assessorService] Got assessment details');
      return {
        success: true,
        data: {
          session: sessionData,
          responses: responses || []
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