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
      api_keys: {
        Row: {
          api_key: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          organization_id: string
          permissions: Json | null
          rate_limit: number | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          organization_id: string
          permissions?: Json | null
          rate_limit?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          api_key?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          organization_id?: string
          permissions?: Json | null
          rate_limit?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_responses: {
        Row: {
          audio_duration: number | null
          audio_url: string | null
          cefr_level: Database["public"]["Enums"]["cefr_level"] | null
          coherence_score: number | null
          created_at: string
          detailed_feedback: Json | null
          fluency_score: number | null
          grammar_score: number | null
          id: string
          is_final: boolean | null
          mistakes_analysis: Json | null
          organization_id: string | null
          overall_score: number | null
          processing_metadata: Json | null
          prompt_id: string
          prompt_order: number
          pronunciation_score: number | null
          session_id: string
          transcript: string | null
          updated_at: string
          user_response: string | null
          vocabulary_score: number | null
        }
        Insert: {
          audio_duration?: number | null
          audio_url?: string | null
          cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          coherence_score?: number | null
          created_at?: string
          detailed_feedback?: Json | null
          fluency_score?: number | null
          grammar_score?: number | null
          id?: string
          is_final?: boolean | null
          mistakes_analysis?: Json | null
          organization_id?: string | null
          overall_score?: number | null
          processing_metadata?: Json | null
          prompt_id: string
          prompt_order: number
          pronunciation_score?: number | null
          session_id: string
          transcript?: string | null
          updated_at?: string
          user_response?: string | null
          vocabulary_score?: number | null
        }
        Update: {
          audio_duration?: number | null
          audio_url?: string | null
          cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          coherence_score?: number | null
          created_at?: string
          detailed_feedback?: Json | null
          fluency_score?: number | null
          grammar_score?: number | null
          id?: string
          is_final?: boolean | null
          mistakes_analysis?: Json | null
          organization_id?: string | null
          overall_score?: number | null
          processing_metadata?: Json | null
          prompt_id?: string
          prompt_order?: number
          pronunciation_score?: number | null
          session_id?: string
          transcript?: string | null
          updated_at?: string
          user_response?: string | null
          vocabulary_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_sessions: {
        Row: {
          approved_at: string | null
          assigned_assessor: string | null
          coherence_score: number | null
          created_at: string
          fluency_score: number | null
          grammar_score: number | null
          has_score_override: boolean | null
          id: string
          metadata: Json | null
          organization_id: string | null
          overall_cefr_level: Database["public"]["Enums"]["cefr_level"] | null
          overall_score: number | null
          override_summary: Json | null
          pronunciation_score: number | null
          reviewed_at: string | null
          session_type: string | null
          status: Database["public"]["Enums"]["assessment_status"] | null
          student_info: Json | null
          updated_at: string
          user_id: string
          vocabulary_score: number | null
        }
        Insert: {
          approved_at?: string | null
          assigned_assessor?: string | null
          coherence_score?: number | null
          created_at?: string
          fluency_score?: number | null
          grammar_score?: number | null
          has_score_override?: boolean | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          overall_cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          overall_score?: number | null
          override_summary?: Json | null
          pronunciation_score?: number | null
          reviewed_at?: string | null
          session_type?: string | null
          status?: Database["public"]["Enums"]["assessment_status"] | null
          student_info?: Json | null
          updated_at?: string
          user_id: string
          vocabulary_score?: number | null
        }
        Update: {
          approved_at?: string | null
          assigned_assessor?: string | null
          coherence_score?: number | null
          created_at?: string
          fluency_score?: number | null
          grammar_score?: number | null
          has_score_override?: boolean | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          overall_cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          overall_score?: number | null
          override_summary?: Json | null
          pronunciation_score?: number | null
          reviewed_at?: string | null
          session_type?: string | null
          status?: Database["public"]["Enums"]["assessment_status"] | null
          student_info?: Json | null
          updated_at?: string
          user_id?: string
          vocabulary_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sessions_assigned_assessor_fkey"
            columns: ["assigned_assessor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessor_reviews: {
        Row: {
          assessor_feedback: string | null
          assessor_id: string
          created_at: string
          id: string
          organization_id: string | null
          override_scores: Json | null
          recommendation: string | null
          review_status: string | null
          reviewed_at: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          assessor_feedback?: string | null
          assessor_id: string
          created_at?: string
          id?: string
          organization_id?: string | null
          override_scores?: Json | null
          recommendation?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          assessor_feedback?: string | null
          assessor_id?: string
          created_at?: string
          id?: string
          organization_id?: string | null
          override_scores?: Json | null
          recommendation?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessor_reviews_assessor_id_fkey"
            columns: ["assessor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessor_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessor_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          api_key: string | null
          created_at: string
          domain: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country_of_citizenship: string | null
          country_of_residence: string | null
          created_at: string
          current_cefr_level: Database["public"]["Enums"]["cefr_level"] | null
          data_consent: boolean | null
          date_of_birth: string | null
          email: string
          email_results: boolean | null
          estimated_level: string | null
          first_language: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_assessment_at: string | null
          organization_id: string | null
          other_reason: string | null
          phone: string | null
          preferred_contact: string | null
          promo_code: string | null
          pronunciation_preference: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          target_language: string | null
          test_reason: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          country_of_citizenship?: string | null
          country_of_residence?: string | null
          created_at?: string
          current_cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          data_consent?: boolean | null
          date_of_birth?: string | null
          email: string
          email_results?: boolean | null
          estimated_level?: string | null
          first_language?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_assessment_at?: string | null
          organization_id?: string | null
          other_reason?: string | null
          phone?: string | null
          preferred_contact?: string | null
          promo_code?: string | null
          pronunciation_preference?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          target_language?: string | null
          test_reason?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          country_of_citizenship?: string | null
          country_of_residence?: string | null
          created_at?: string
          current_cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          data_consent?: boolean | null
          date_of_birth?: string | null
          email?: string
          email_results?: boolean | null
          estimated_level?: string | null
          first_language?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_assessment_at?: string | null
          organization_id?: string | null
          other_reason?: string | null
          phone?: string | null
          preferred_contact?: string | null
          promo_code?: string | null
          pronunciation_preference?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          target_language?: string | null
          test_reason?: string | null
          updated_at?: string
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
      prompts: {
        Row: {
          audio_url: string | null
          cefr_level: Database["public"]["Enums"]["cefr_level"]
          content: string
          created_at: string
          created_by: string | null
          expected_duration: number | null
          id: string
          instructions: string | null
          is_active: boolean | null
          organization_id: string | null
          title: string
          type: Database["public"]["Enums"]["prompt_type"]
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          cefr_level: Database["public"]["Enums"]["cefr_level"]
          content: string
          created_at?: string
          created_by?: string | null
          expected_duration?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          organization_id?: string | null
          title: string
          type: Database["public"]["Enums"]["prompt_type"]
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          cefr_level?: Database["public"]["Enums"]["cefr_level"]
          content?: string
          created_at?: string
          created_by?: string | null
          expected_duration?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          organization_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["prompt_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_data: {
        Row: {
          assessor_feedback: string | null
          created_at: string
          id: string
          organization_id: string | null
          prompt_text: string | null
          quality_rating: number | null
          response_id: string | null
          scores: Json | null
          transcript: string | null
          user_response: string | null
        }
        Insert: {
          assessor_feedback?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          prompt_text?: string | null
          quality_rating?: number | null
          response_id?: string | null
          scores?: Json | null
          transcript?: string | null
          user_response?: string | null
        }
        Update: {
          assessor_feedback?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          prompt_text?: string | null
          quality_rating?: number | null
          response_id?: string | null
          scores?: Json | null
          transcript?: string | null
          user_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_data_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_data_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "assessment_responses"
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
      assessment_status:
        | "in_progress"
        | "completed"
        | "under_review"
        | "approved"
        | "rejected"
      cefr_level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
      prompt_type: "speaking" | "read_aloud" | "conversation"
      user_role: "admin" | "assessor" | "learner"
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
    Enums: {
      assessment_status: [
        "in_progress",
        "completed",
        "under_review",
        "approved",
        "rejected",
      ],
      cefr_level: ["A1", "A2", "B1", "B2", "C1", "C2"],
      prompt_type: ["speaking", "read_aloud", "conversation"],
      user_role: ["admin", "assessor", "learner"],
    },
  },
} as const
