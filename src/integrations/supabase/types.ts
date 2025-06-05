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
      competition_participations: {
        Row: {
          competition_id: string | null
          created_at: string | null
          id: string
          payment_date: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          prize: number | null
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "game_sessions_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          code: string
          created_at: string | null
          id: string
          invited_by: string | null
          is_active: boolean | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      prize_distributions: {
        Row: {
          amount: number
          competition_id: string | null
          created_at: string | null
          id: string
          percentage: number
          position: number
        }
        Insert: {
          amount: number
          competition_id?: string | null
          created_at?: string | null
          id?: string
          percentage: number
          position: number
        }
        Update: {
          amount?: number
          competition_id?: string | null
          created_at?: string | null
          id?: string
          percentage?: number
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "prize_distributions_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          best_daily_position: number | null
          best_weekly_position: number | null
          created_at: string | null
          games_played: number | null
          id: string
          total_score: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          best_daily_position?: number | null
          best_weekly_position?: number | null
          created_at?: string | null
          games_played?: number | null
          id: string
          total_score?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          best_daily_position?: number | null
          best_weekly_position?: number | null
          created_at?: string | null
          games_played?: number | null
          id?: string
          total_score?: number | null
          updated_at?: string | null
          username?: string
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      competition_type: "daily" | "weekly" | "challenge"
      payment_status: "pending" | "paid" | "not_eligible"
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
      payment_status: ["pending", "paid", "not_eligible"],
    },
  },
} as const
