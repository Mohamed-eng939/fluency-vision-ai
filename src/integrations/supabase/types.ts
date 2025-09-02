export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_usage_logs: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown | null
          method: string
          organization_id: string | null
          processing_time: number | null
          request_size: number | null
          response_size: number | null
          status_code: number | null
          tokens_used: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown | null
          method: string
          organization_id?: string | null
          processing_time?: number | null
          request_size?: number | null
          response_size?: number | null
          status_code?: number | null
          tokens_used?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          method?: string
          organization_id?: string | null
          processing_time?: number | null
          request_size?: number | null
          response_size?: number | null
          status_code?: number | null
          tokens_used?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_analytics: {
        Row: {
          avg_completion_rate: number | null
          avg_processing_time: number | null
          avg_score: number | null
          cefr_distribution: Json | null
          created_at: string | null
          id: string
          organization_id: string | null
          performance_by_prompt: Json | null
          period_end: string
          period_start: string
          period_type: string
          score_distribution: Json | null
          scores_by_skill: Json | null
          success_rate: number | null
          total_assessments: number | null
          total_users: number | null
        }
        Insert: {
          avg_completion_rate?: number | null
          avg_processing_time?: number | null
          avg_score?: number | null
          cefr_distribution?: Json | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          performance_by_prompt?: Json | null
          period_end: string
          period_start: string
          period_type: string
          score_distribution?: Json | null
          scores_by_skill?: Json | null
          success_rate?: number | null
          total_assessments?: number | null
          total_users?: number | null
        }
        Update: {
          avg_completion_rate?: number | null
          avg_processing_time?: number | null
          avg_score?: number | null
          cefr_distribution?: Json | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          performance_by_prompt?: Json | null
          period_end?: string
          period_start?: string
          period_type?: string
          score_distribution?: Json | null
          scores_by_skill?: Json | null
          success_rate?: number | null
          total_assessments?: number | null
          total_users?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_reviews: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          original_score: number | null
          quality_flags: Json | null
          response_id: string | null
          review_status: string | null
          review_type: string
          reviewed_score: number | null
          reviewer_id: string | null
          reviewer_notes: string | null
          score_adjustment: number | null
          score_justification: string | null
          session_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          original_score?: number | null
          quality_flags?: Json | null
          response_id?: string | null
          review_status?: string | null
          review_type: string
          reviewed_score?: number | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          score_adjustment?: number | null
          score_justification?: string | null
          session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          original_score?: number | null
          quality_flags?: Json | null
          response_id?: string | null
          review_status?: string | null
          review_type?: string
          reviewed_score?: number | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          score_adjustment?: number | null
          score_justification?: string | null
          session_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_reviews_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "prompt_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_sessions: {
        Row: {
          assessment_settings: Json | null
          cefr_level: string | null
          completed_at: string | null
          confidence_score: number | null
          created_at: string | null
          has_score_override: boolean | null
          id: string
          organization_id: string | null
          overall_score: number | null
          override_summary: Json | null
          session_type: string
          started_at: string | null
          status: string | null
          student_country: string | null
          student_email: string | null
          student_name: string | null
          student_phone: string | null
          target_cefr_level: string | null
          total_prompts: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_settings?: Json | null
          cefr_level?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          has_score_override?: boolean | null
          id?: string
          organization_id?: string | null
          overall_score?: number | null
          override_summary?: Json | null
          session_type: string
          started_at?: string | null
          status?: string | null
          student_country?: string | null
          student_email?: string | null
          student_name?: string | null
          student_phone?: string | null
          target_cefr_level?: string | null
          total_prompts?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_settings?: Json | null
          cefr_level?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          has_score_override?: boolean | null
          id?: string
          organization_id?: string | null
          overall_score?: number | null
          override_summary?: Json | null
          session_type?: string
          started_at?: string | null
          status?: string | null
          student_country?: string | null
          student_email?: string | null
          student_name?: string | null
          student_phone?: string | null
          target_cefr_level?: string | null
          total_prompts?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_recordings: {
        Row: {
          bit_rate: number | null
          channels: number | null
          created_at: string | null
          duration: number | null
          expires_at: string | null
          file_path: string
          file_size: number | null
          format: string | null
          id: string
          is_processed: boolean | null
          organization_id: string | null
          original_filename: string | null
          response_id: string | null
          sample_rate: number | null
          storage_tier: string | null
          transcription_status: string | null
        }
        Insert: {
          bit_rate?: number | null
          channels?: number | null
          created_at?: string | null
          duration?: number | null
          expires_at?: string | null
          file_path: string
          file_size?: number | null
          format?: string | null
          id?: string
          is_processed?: boolean | null
          organization_id?: string | null
          original_filename?: string | null
          response_id?: string | null
          sample_rate?: number | null
          storage_tier?: string | null
          transcription_status?: string | null
        }
        Update: {
          bit_rate?: number | null
          channels?: number | null
          created_at?: string | null
          duration?: number | null
          expires_at?: string | null
          file_path?: string
          file_size?: number | null
          format?: string | null
          id?: string
          is_processed?: boolean | null
          organization_id?: string | null
          original_filename?: string | null
          response_id?: string | null
          sample_rate?: number | null
          storage_tier?: string | null
          transcription_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_recordings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_recordings_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "prompt_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          max_assessments_per_month: number | null
          max_users: number | null
          name: string
          settings: Json | null
          slug: string
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_assessments_per_month?: number | null
          max_users?: number | null
          name: string
          settings?: Json | null
          slug: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_assessments_per_month?: number | null
          max_users?: number | null
          name?: string
          settings?: Json | null
          slug?: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_expires_at: string | null
          access_granted_at: string | null
          access_granted_by: string | null
          assessment_credits: number | null
          avatar_url: string | null
          country_of_citizenship: string | null
          country_of_residence: string | null
          created_at: string | null
          data_consent: boolean | null
          date_of_birth: string | null
          email: string | null
          email_results: boolean | null
          estimated_level: string | null
          first_language: string | null
          has_assessment_access: boolean | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          name: string | null
          organization_id: string | null
          other_reason: string | null
          payment_status: string | null
          phone: string | null
          preferred_contact: string | null
          promo_code: string | null
          pronunciation_preference: string | null
          role: string
          subscription_status: string | null
          test_reason: string | null
          timezone: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          access_granted_by?: string | null
          assessment_credits?: number | null
          avatar_url?: string | null
          country_of_citizenship?: string | null
          country_of_residence?: string | null
          created_at?: string | null
          data_consent?: boolean | null
          date_of_birth?: string | null
          email?: string | null
          email_results?: boolean | null
          estimated_level?: string | null
          first_language?: string | null
          has_assessment_access?: boolean | null
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string | null
          organization_id?: string | null
          other_reason?: string | null
          payment_status?: string | null
          phone?: string | null
          preferred_contact?: string | null
          promo_code?: string | null
          pronunciation_preference?: string | null
          role?: string
          subscription_status?: string | null
          test_reason?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          access_granted_by?: string | null
          assessment_credits?: number | null
          avatar_url?: string | null
          country_of_citizenship?: string | null
          country_of_residence?: string | null
          created_at?: string | null
          data_consent?: boolean | null
          date_of_birth?: string | null
          email?: string | null
          email_results?: boolean | null
          estimated_level?: string | null
          first_language?: string | null
          has_assessment_access?: boolean | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string | null
          organization_id?: string | null
          other_reason?: string | null
          payment_status?: string | null
          phone?: string | null
          preferred_contact?: string | null
          promo_code?: string | null
          pronunciation_preference?: string | null
          role?: string
          subscription_status?: string | null
          test_reason?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_responses: {
        Row: {
          audio_analysis: Json | null
          audio_url: string | null
          cefr_level: string | null
          coherence_analysis: Json | null
          completed_at: string | null
          confidence_score: number | null
          created_at: string | null
          fallback_info: Json | null
          id: string
          metrics: Json | null
          processing_error: string | null
          processing_status: string | null
          prompt_id: string | null
          prompt_order: number | null
          response_duration: number | null
          session_id: string | null
          started_at: string | null
          transcript: string | null
        }
        Insert: {
          audio_analysis?: Json | null
          audio_url?: string | null
          cefr_level?: string | null
          coherence_analysis?: Json | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          fallback_info?: Json | null
          id?: string
          metrics?: Json | null
          processing_error?: string | null
          processing_status?: string | null
          prompt_id?: string | null
          prompt_order?: number | null
          response_duration?: number | null
          session_id?: string | null
          started_at?: string | null
          transcript?: string | null
        }
        Update: {
          audio_analysis?: Json | null
          audio_url?: string | null
          cefr_level?: string | null
          coherence_analysis?: Json | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          fallback_info?: Json | null
          id?: string
          metrics?: Json | null
          processing_error?: string | null
          processing_status?: string | null
          prompt_id?: string | null
          prompt_order?: number | null
          response_duration?: number | null
          session_id?: string | null
          started_at?: string | null
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_responses_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          category: string
          cefr_level: string
          cefr_weight_mapping: Json | null
          created_at: string | null
          created_by: string | null
          difficulty: string
          difficulty_weight: number | null
          hint: string | null
          id: string
          is_active: boolean | null
          is_global: boolean | null
          order_index: number | null
          organization_id: string | null
          text: string
          time_limit: number | null
          topic: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          cefr_level: string
          cefr_weight_mapping?: Json | null
          created_at?: string | null
          created_by?: string | null
          difficulty: string
          difficulty_weight?: number | null
          hint?: string | null
          id: string
          is_active?: boolean | null
          is_global?: boolean | null
          order_index?: number | null
          organization_id?: string | null
          text: string
          time_limit?: number | null
          topic?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          cefr_level?: string
          cefr_weight_mapping?: Json | null
          created_at?: string | null
          created_by?: string | null
          difficulty?: string
          difficulty_weight?: number | null
          hint?: string | null
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          order_index?: number | null
          organization_id?: string | null
          text?: string
          time_limit?: number | null
          topic?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          assessment_id: string | null
          audio_url: string | null
          created_at: string | null
          id: string
          is_final: boolean | null
          prompt_text: string | null
          reviewer_notes: string | null
          scores: Json | null
          transcript: string | null
        }
        Insert: {
          assessment_id?: string | null
          audio_url?: string | null
          created_at?: string | null
          id?: string
          is_final?: boolean | null
          prompt_text?: string | null
          reviewer_notes?: string | null
          scores?: Json | null
          transcript?: string | null
        }
        Update: {
          assessment_id?: string | null
          audio_url?: string | null
          created_at?: string | null
          id?: string
          is_final?: boolean | null
          prompt_text?: string | null
          reviewer_notes?: string | null
          scores?: Json | null
          transcript?: string | null
        }
        Relationships: []
      }
      score_overrides: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          original_scores: Json
          overridden_at: string
          overridden_by: string
          override_notes: Json
          override_reason: string | null
          override_scores: Json
          response_id: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          original_scores?: Json
          overridden_at?: string
          overridden_by: string
          override_notes?: Json
          override_reason?: string | null
          override_scores?: Json
          response_id?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          original_scores?: Json
          overridden_at?: string
          overridden_by?: string
          override_notes?: Json
          override_reason?: string | null
          override_scores?: Json
          response_id?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      scoring_configurations: {
        Row: {
          cefr_thresholds: Json | null
          coherence_weight: number | null
          created_at: string | null
          created_by: string | null
          custom_rubrics: Json | null
          description: string | null
          fluency_weight: number | null
          grammar_weight: number | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          organization_id: string | null
          pronunciation_weight: number | null
          prosody_weight: number | null
          syntax_weight: number | null
          updated_at: string | null
          vocabulary_weight: number | null
        }
        Insert: {
          cefr_thresholds?: Json | null
          coherence_weight?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_rubrics?: Json | null
          description?: string | null
          fluency_weight?: number | null
          grammar_weight?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          organization_id?: string | null
          pronunciation_weight?: number | null
          prosody_weight?: number | null
          syntax_weight?: number | null
          updated_at?: string | null
          vocabulary_weight?: number | null
        }
        Update: {
          cefr_thresholds?: Json | null
          coherence_weight?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_rubrics?: Json | null
          description?: string | null
          fluency_weight?: number | null
          grammar_weight?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          organization_id?: string | null
          pronunciation_weight?: number | null
          prosody_weight?: number | null
          syntax_weight?: number | null
          updated_at?: string | null
          vocabulary_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scoring_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_results: {
        Row: {
          coherence_feedback: string | null
          coherence_score: number | null
          created_at: string | null
          fluency_feedback: string | null
          fluency_score: number | null
          grammar_feedback: string | null
          grammar_score: number | null
          id: string
          overall_feedback: string | null
          pause_analysis: Json | null
          pronunciation_analysis: Json | null
          pronunciation_feedback: string | null
          pronunciation_score: number | null
          prosody_feedback: string | null
          prosody_score: number | null
          response_id: string | null
          scoring_method: string | null
          scoring_version: string | null
          speech_rate: number | null
          syntax_feedback: string | null
          syntax_score: number | null
          vocabulary_analysis: Json | null
          vocabulary_feedback: string | null
          vocabulary_score: number | null
        }
        Insert: {
          coherence_feedback?: string | null
          coherence_score?: number | null
          created_at?: string | null
          fluency_feedback?: string | null
          fluency_score?: number | null
          grammar_feedback?: string | null
          grammar_score?: number | null
          id?: string
          overall_feedback?: string | null
          pause_analysis?: Json | null
          pronunciation_analysis?: Json | null
          pronunciation_feedback?: string | null
          pronunciation_score?: number | null
          prosody_feedback?: string | null
          prosody_score?: number | null
          response_id?: string | null
          scoring_method?: string | null
          scoring_version?: string | null
          speech_rate?: number | null
          syntax_feedback?: string | null
          syntax_score?: number | null
          vocabulary_analysis?: Json | null
          vocabulary_feedback?: string | null
          vocabulary_score?: number | null
        }
        Update: {
          coherence_feedback?: string | null
          coherence_score?: number | null
          created_at?: string | null
          fluency_feedback?: string | null
          fluency_score?: number | null
          grammar_feedback?: string | null
          grammar_score?: number | null
          id?: string
          overall_feedback?: string | null
          pause_analysis?: Json | null
          pronunciation_analysis?: Json | null
          pronunciation_feedback?: string | null
          pronunciation_score?: number | null
          prosody_feedback?: string | null
          prosody_score?: number | null
          response_id?: string | null
          scoring_method?: string | null
          scoring_version?: string | null
          speech_rate?: number | null
          syntax_feedback?: string | null
          syntax_score?: number | null
          vocabulary_analysis?: Json | null
          vocabulary_feedback?: string | null
          vocabulary_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scoring_results_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "prompt_responses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      is_admin_or_assessor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      same_organization: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
