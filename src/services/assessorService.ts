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

      // Check user role first
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, organization_id')
        .eq('id', session.user.id)
        .single();

      console.log('👤 [assessorService] User profile:', profile);

      if (!profile || !['assessor', 'admin'].includes(profile.role)) {
        console.log('⚠️ [assessorService] User does not have assessor permissions');
        return {
          success: false,
          error: 'Insufficient permissions - assessor role required'
        };
      }

      // Try Edge Function first with proper endpoint
      try {
        console.log('📡 [assessorService] Trying edge function...');
        const supabaseUrl = 'https://rrslhxigqtfllunmowcy.supabase.co';
        const response = await fetch(`${supabaseUrl}/functions/v1/assessor-manager/pending-assessments`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyc2xoeGlncXRmbGx1bm1vd2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI0NDUsImV4cCI6MjA2NjUyODQ0NX0.k3wjgHGU3d_k0vzSMP2jeKaXMs85zrhu_vb4Ym2Sq9c',
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 [assessorService] Edge function response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.log('📡 [assessorService] Edge function error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('📡 [assessorService] Edge function response data:', data);
        
        if (!data?.success) {
          throw new Error(data?.error || 'Failed to get pending assessments');
        }

        console.log('✅ [assessorService] Got pending assessments via Edge Function:', data.assessments?.length);
        return {
          success: true,
          data: data.assessments || []
        };
      } catch (edgeError) {
        console.log('🔄 [assessorService] Edge Function failed, trying direct DB...', edgeError);
        
        // Fallback to direct database query
        console.log('📊 [assessorService] Using direct database query...');
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
          .order('created_at', { ascending: false });

        if (dbError) {
          console.error('❌ [assessorService] DB query failed:', dbError);
          throw new Error(dbError.message);
        }

        console.log('✅ [assessorService] Got pending assessments via direct DB:', sessions?.length);
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
          status: 'under_review',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('status', 'completed')
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