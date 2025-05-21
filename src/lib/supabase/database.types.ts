
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          username: string | null
          email: string | null
          phone: string | null
          citizenship_country: string | null
          residence_country: string | null
          date_of_birth: string | null
          first_language: string | null
          test_reason: string | null
          other_reason: string | null
          estimated_level: string | null
          preferred_contact: string | null
          pronunciation_preference: string | null
          promo_code: string | null
          data_consent: boolean | null
          role: string | null
          institution: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name?: string | null
          username?: string | null
          email?: string | null
          phone?: string | null
          citizenship_country?: string | null
          residence_country?: string | null
          date_of_birth?: string | null
          first_language?: string | null
          test_reason?: string | null
          other_reason?: string | null
          estimated_level?: string | null
          preferred_contact?: string | null
          pronunciation_preference?: string | null
          promo_code?: string | null
          data_consent?: boolean | null
          role?: string | null
          institution?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          username?: string | null
          email?: string | null
          phone?: string | null
          citizenship_country?: string | null
          residence_country?: string | null
          date_of_birth?: string | null
          first_language?: string | null
          test_reason?: string | null
          other_reason?: string | null
          estimated_level?: string | null
          preferred_contact?: string | null
          pronunciation_preference?: string | null
          promo_code?: string | null
          data_consent?: boolean | null
          role?: string | null
          institution?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          session_id: string
          type: string
          status: string
          started_at: string | null
          completed_at: string | null
          email_results: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          type: string
          status?: string
          started_at?: string | null
          completed_at?: string | null
          email_results?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          type?: string
          status?: string
          started_at?: string | null
          completed_at?: string | null
          email_results?: boolean | null
        }
      }
      prompts: {
        Row: {
          id: string
          text: string
          cefr_level: string
          category: string | null
          type: string
          created_at: string | null
          updated_at: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          text: string
          cefr_level: string
          category?: string | null
          type?: string
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          text?: string
          cefr_level?: string
          category?: string | null
          type?: string
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
        }
      }
      audio_recordings: {
        Row: {
          id: string
          assessment_id: string
          prompt_id: string | null
          storage_path: string
          duration: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          assessment_id: string
          prompt_id?: string | null
          storage_path: string
          duration?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          assessment_id?: string
          prompt_id?: string | null
          storage_path?: string
          duration?: number | null
          created_at?: string | null
        }
      }
      prompt_responses: {
        Row: {
          id: string
          assessment_id: string
          prompt_id: string | null
          audio_recording_id: string | null
          transcript: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          assessment_id: string
          prompt_id?: string | null
          audio_recording_id?: string | null
          transcript?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          assessment_id?: string
          prompt_id?: string | null
          audio_recording_id?: string | null
          transcript?: string | null
          created_at?: string | null
        }
      }
      assessment_results: {
        Row: {
          id: string
          assessment_id: string
          cefr_level: string
          total_score: number
          fluency_score: number | null
          grammar_score: number | null
          pronunciation_score: number | null
          vocabulary_score: number | null
          detailed_feedback: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          assessment_id: string
          cefr_level: string
          total_score: number
          fluency_score?: number | null
          grammar_score?: number | null
          pronunciation_score?: number | null
          vocabulary_score?: number | null
          detailed_feedback?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          assessment_id?: string
          cefr_level?: string
          total_score?: number
          fluency_score?: number | null
          grammar_score?: number | null
          pronunciation_score?: number | null
          vocabulary_score?: number | null
          detailed_feedback?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      review_log: {
        Row: {
          id: string
          assessment_id: string
          assessor_id: string
          original_cefr_level: string | null
          override_cefr_level: string | null
          override_reason: string | null
          feedback: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          assessment_id: string
          assessor_id: string
          original_cefr_level?: string | null
          override_cefr_level?: string | null
          override_reason?: string | null
          feedback?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          assessment_id?: string
          assessor_id?: string
          original_cefr_level?: string | null
          override_cefr_level?: string | null
          override_reason?: string | null
          feedback?: string | null
          created_at?: string | null
        }
      }
      api_keys: {
        Row: {
          id: string
          name: string
          key: string
          institution: string | null
          created_by: string | null
          expires_at: string | null
          created_at: string | null
          active: boolean | null
        }
        Insert: {
          id?: string
          name: string
          key: string
          institution?: string | null
          created_by?: string | null
          expires_at?: string | null
          created_at?: string | null
          active?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          key?: string
          institution?: string | null
          created_by?: string | null
          expires_at?: string | null
          created_at?: string | null
          active?: boolean | null
        }
      }
      training_data: {
        Row: {
          id: string
          prompt_response_id: string | null
          audio_path: string | null
          transcript: string | null
          system_cefr_level: string | null
          human_cefr_level: string | null
          feature_vector: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          prompt_response_id?: string | null
          audio_path?: string | null
          transcript?: string | null
          system_cefr_level?: string | null
          human_cefr_level?: string | null
          feature_vector?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          prompt_response_id?: string | null
          audio_path?: string | null
          transcript?: string | null
          system_cefr_level?: string | null
          human_cefr_level?: string | null
          feature_vector?: Json | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
