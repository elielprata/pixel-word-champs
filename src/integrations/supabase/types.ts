export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          affected_users: number | null
          automation_type: string
          created_at: string
          error_message: string | null
          executed_at: string | null
          execution_status: string
          id: string
          scheduled_time: string
          settings_snapshot: Json | null
        }
        Insert: {
          affected_users?: number | null
          automation_type: string
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          execution_status?: string
          id?: string
          scheduled_time: string
          settings_snapshot?: Json | null
        }
        Update: {
          affected_users?: number | null
          automation_type?: string
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          execution_status?: string
          id?: string
          scheduled_time?: string
          settings_snapshot?: Json | null
        }
        Relationships: []
      }
      challenge_progress: {
        Row: {
          challenge_id: number
          completed_at: string | null
          created_at: string | null
          current_level: number | null
          id: string
          is_completed: boolean | null
          total_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: number
          completed_at?: string | null
          created_at?: string | null
          current_level?: number | null
          id?: string
          is_completed?: boolean | null
          total_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: number
          completed_at?: string | null
          created_at?: string | null
          current_level?: number | null
          id?: string
          is_completed?: boolean | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: number
          is_active: boolean | null
          levels: number | null
          theme: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id: number
          is_active?: boolean | null
          levels?: number | null
          theme?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: number
          is_active?: boolean | null
          levels?: number | null
          theme?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      competition_history: {
        Row: {
          competition_end_date: string
          competition_id: string
          competition_start_date: string
          competition_title: string
          competition_type: string
          created_at: string
          final_position: number
          final_score: number
          finalized_at: string
          id: string
          prize_earned: number | null
          total_participants: number
          user_id: string
        }
        Insert: {
          competition_end_date: string
          competition_id: string
          competition_start_date: string
          competition_title: string
          competition_type: string
          created_at?: string
          final_position: number
          final_score?: number
          finalized_at?: string
          id?: string
          prize_earned?: number | null
          total_participants?: number
          user_id: string
        }
        Update: {
          competition_end_date?: string
          competition_id?: string
          competition_start_date?: string
          competition_title?: string
          competition_type?: string
          created_at?: string
          final_position?: number
          final_score?: number
          finalized_at?: string
          id?: string
          prize_earned?: number | null
          total_participants?: number
          user_id?: string
        }
        Relationships: []
      }
      competition_participations: {
        Row: {
          competition_id: string | null
          created_at: string | null
          id: string
          payment_date: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          prize: number | null
          user_id: string
          user_position: number | null
          user_score: number | null
        }
        Insert: {
          competition_id?: string | null
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          prize?: number | null
          user_id: string
          user_position?: number | null
          user_score?: number | null
        }
        Update: {
          competition_id?: string | null
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          prize?: number | null
          user_id?: string
          user_position?: number | null
          user_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_participations_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          prize_pool: number | null
          title: string
          total_participants: number | null
          type: Database["public"]["Enums"]["competition_type"]
          updated_at: string | null
          week_end: string | null
          week_start: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          prize_pool?: number | null
          title: string
          total_participants?: number | null
          type: Database["public"]["Enums"]["competition_type"]
          updated_at?: string | null
          week_end?: string | null
          week_start?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          prize_pool?: number | null
          title?: string
          total_participants?: number | null
          type?: Database["public"]["Enums"]["competition_type"]
          updated_at?: string | null
          week_end?: string | null
          week_start?: string | null
        }
        Relationships: []
      }
      custom_competitions: {
        Row: {
          competition_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          entry_requirements: Json | null
          id: string
          max_participants: number | null
          prize_pool: number | null
          rules: Json | null
          start_date: string
          status: string | null
          theme: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          competition_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          entry_requirements?: Json | null
          id?: string
          max_participants?: number | null
          prize_pool?: number | null
          rules?: Json | null
          start_date: string
          status?: string | null
          theme?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          competition_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          entry_requirements?: Json | null
          id?: string
          max_participants?: number | null
          prize_pool?: number | null
          rules?: Json | null
          start_date?: string
          status?: string | null
          theme?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          board: Json
          competition_id: string | null
          completed_at: string | null
          id: string
          is_completed: boolean | null
          level: number
          started_at: string | null
          time_elapsed: number | null
          total_score: number | null
          user_id: string
          words_found: Json | null
        }
        Insert: {
          board: Json
          competition_id?: string | null
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          level?: number
          started_at?: string | null
          time_elapsed?: number | null
          total_score?: number | null
          user_id: string
          words_found?: Json | null
        }
        Update: {
          board?: Json
          competition_id?: string | null
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          level?: number
          started_at?: string | null
          time_elapsed?: number | null
          total_score?: number | null
          user_id?: string
          words_found?: Json | null
        }
        Relationships: []
      }
      game_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invite_rewards: {
        Row: {
          created_at: string | null
          id: string
          invite_code: string
          invited_user_id: string
          processed_at: string | null
          reward_amount: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invite_code: string
          invited_user_id: string
          processed_at?: string | null
          reward_amount?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invite_code?: string
          invited_user_id?: string
          processed_at?: string | null
          reward_amount?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          code: string
          created_at: string | null
          id: string
          invited_by: string | null
          invited_user_level: number | null
          invited_user_score: number | null
          is_active: boolean | null
          rewards_earned: number | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          invited_user_level?: number | null
          invited_user_score?: number | null
          is_active?: boolean | null
          rewards_earned?: number | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          invited_user_level?: number | null
          invited_user_score?: number | null
          is_active?: boolean | null
          rewards_earned?: number | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      level_words: {
        Row: {
          category: string | null
          created_at: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          level: number
          updated_at: string | null
          word: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          level: number
          updated_at?: string | null
          word: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          level?: number
          updated_at?: string | null
          word?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_status: string
          pix_holder_name: string | null
          pix_key: string | null
          prize_amount: number
          ranking_id: string | null
          ranking_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_status?: string
          pix_holder_name?: string | null
          pix_key?: string | null
          prize_amount: number
          ranking_id?: string | null
          ranking_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_status?: string
          pix_holder_name?: string | null
          pix_key?: string | null
          prize_amount?: number
          ranking_id?: string | null
          ranking_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prize_configurations: {
        Row: {
          active: boolean
          created_at: string | null
          group_name: string | null
          id: string
          position: number | null
          position_range: string | null
          prize_amount: number
          total_winners: number
          type: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          group_name?: string | null
          id?: string
          position?: number | null
          position_range?: string | null
          prize_amount?: number
          total_winners?: number
          type: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          group_name?: string | null
          id?: string
          position?: number | null
          position_range?: string | null
          prize_amount?: number
          total_winners?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prize_distributions: {
        Row: {
          competition_id: string | null
          created_at: string | null
          id: string
          payment_status: string | null
          pix_holder_name: string | null
          pix_key: string | null
          position: number
          prize_amount: number
          ranking_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          competition_id?: string | null
          created_at?: string | null
          id?: string
          payment_status?: string | null
          pix_holder_name?: string | null
          pix_key?: string | null
          position: number
          prize_amount: number
          ranking_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          competition_id?: string | null
          created_at?: string | null
          id?: string
          payment_status?: string | null
          pix_holder_name?: string | null
          pix_key?: string | null
          position?: number
          prize_amount?: number
          ranking_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          best_daily_position: number | null
          best_weekly_position: number | null
          created_at: string | null
          experience_points: number | null
          games_played: number | null
          id: string
          is_banned: boolean | null
          pix_holder_name: string | null
          pix_key: string | null
          total_score: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          best_daily_position?: number | null
          best_weekly_position?: number | null
          created_at?: string | null
          experience_points?: number | null
          games_played?: number | null
          id: string
          is_banned?: boolean | null
          pix_holder_name?: string | null
          pix_key?: string | null
          total_score?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          best_daily_position?: number | null
          best_weekly_position?: number | null
          created_at?: string | null
          experience_points?: number | null
          games_played?: number | null
          id?: string
          is_banned?: boolean | null
          pix_holder_name?: string | null
          pix_key?: string | null
          total_score?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string
          message: string
          priority: string | null
          report_type: string
          resolution: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          report_type: string
          resolution?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          report_type?: string
          resolution?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_word_history: {
        Row: {
          category: string
          competition_id: string | null
          created_at: string
          id: string
          level: number
          used_at: string
          user_id: string
          word: string
        }
        Insert: {
          category?: string
          competition_id?: string | null
          created_at?: string
          id?: string
          level?: number
          used_at?: string
          user_id: string
          word: string
        }
        Update: {
          category?: string
          competition_id?: string | null
          created_at?: string
          id?: string
          level?: number
          used_at?: string
          user_id?: string
          word?: string
        }
        Relationships: []
      }
      weekly_competitions_backup: {
        Row: {
          competition_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          entry_requirements: Json | null
          id: string | null
          max_participants: number | null
          prize_pool: number | null
          rules: Json | null
          start_date: string | null
          status: string | null
          theme: string | null
          title: string | null
          updated_at: string | null
          weekly_tournament_id: string | null
        }
        Insert: {
          competition_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          entry_requirements?: Json | null
          id?: string | null
          max_participants?: number | null
          prize_pool?: number | null
          rules?: Json | null
          start_date?: string | null
          status?: string | null
          theme?: string | null
          title?: string | null
          updated_at?: string | null
          weekly_tournament_id?: string | null
        }
        Update: {
          competition_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          entry_requirements?: Json | null
          id?: string | null
          max_participants?: number | null
          prize_pool?: number | null
          rules?: Json | null
          start_date?: string | null
          status?: string | null
          theme?: string | null
          title?: string | null
          updated_at?: string | null
          weekly_tournament_id?: string | null
        }
        Relationships: []
      }
      weekly_config: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      weekly_rankings: {
        Row: {
          created_at: string | null
          id: string
          payment_status: string | null
          pix_holder_name: string | null
          pix_key: string | null
          position: number
          prize_amount: number | null
          total_score: number
          updated_at: string | null
          user_id: string
          username: string
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_status?: string | null
          pix_holder_name?: string | null
          pix_key?: string | null
          position: number
          prize_amount?: number | null
          total_score?: number
          updated_at?: string | null
          user_id: string
          username: string
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_status?: string | null
          pix_holder_name?: string | null
          pix_key?: string | null
          position?: number
          prize_amount?: number | null
          total_score?: number
          updated_at?: string | null
          user_id?: string
          username?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      word_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      words_found: {
        Row: {
          found_at: string | null
          id: string
          points: number
          positions: Json
          session_id: string | null
          word: string
        }
        Insert: {
          found_at?: string | null
          id?: string
          points: number
          positions: Json
          session_id?: string | null
          word: string
        }
        Update: {
          found_at?: string | null
          id?: string
          points?: number
          positions?: Json
          session_id?: string | null
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "words_found_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mv_current_weekly_ranking: {
        Row: {
          last_updated: string | null
          pix_holder_name: string | null
          pix_key: string | null
          position: number | null
          total_score: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_prize_for_position: {
        Args: { user_position: number } | { user_position: number }
        Returns: number
      }
      check_user_availability: {
        Args: { check_username?: string; check_email?: string }
        Returns: Json
      }
      cleanup_invalid_sessions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_orphaned_rankings: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      diagnose_ranking_system: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      fix_orphaned_scores: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_invite_data_optimized: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_users_with_real_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          username: string
          email: string
          total_score: number
          games_played: number
          is_banned: boolean
          banned_at: string
          banned_by: string
          ban_reason: string
          created_at: string
          roles: string[]
        }[]
      }
      get_weekly_ranking_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      refresh_ranking_view: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_weekly_scores_and_positions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      should_reset_weekly_ranking: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      sync_user_scores_to_weekly_ranking: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_competition_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_daily_competition_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_daily_competitions_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_daily_ranking: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_best_weekly_position: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_weekly_ranking: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_scoring_integrity: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      competition_type: "daily" | "weekly" | "challenge"
      payment_status: "pending" | "paid" | "failed" | "not_eligible"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      competition_type: ["daily", "weekly", "challenge"],
      payment_status: ["pending", "paid", "failed", "not_eligible"],
    },
  },
} as const
