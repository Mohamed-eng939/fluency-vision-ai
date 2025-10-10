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
      console.log('🔍 [assessorService] Fetching pending assessments (TEST MODE - NO AUTH)...');
      
      // TEMPORARY: Skip authentication for testing
      console.log('🧪 [assessorService] BYPASSING AUTH FOR TESTING');

      // TEMPORARY: Skip edge function and go directly to DB
      console.log('🧪 [assessorService] Skipping edge function for test mode');
        
      // Direct database query (no auth required in test mode)
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
      console.log('📝 [assessorService] Assigning assessment (TEST MODE):', sessionId);
      
      // TEMPORARY: Use mock assessor ID for testing
      const mockAssessorId = 'b963c6d3-446e-4eca-a9b5-5cdc86fdf649'; // leo.messi's ID

      const { data, error } = await supabase
        .from('assessment_sessions')
        .update({
          assigned_assessor: mockAssessorId,
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
      console.log('🔍 [assessorService] Fetching assessment details (TEST MODE):', sessionId);

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

      // Get responses from database
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