
// Corrigir tipagem inconsistente da interface User
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  total_score: number;
  games_played: number;
  best_daily_position?: number;
  best_weekly_position?: number;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  competition_id?: string;
  level: number;
  board: any;
  words_found: string[];
  total_score: number;
  time_elapsed: number;
  is_completed: boolean;
  started_at: string;
  completed_at?: string;
}

export interface Competition {
  id: string;
  title: string;
  description?: string;
  type: 'daily' | 'weekly' | 'challenge';
  prize_pool: number;
  total_participants: number;
  is_active: boolean;
  week_start?: string;
  week_end?: string;
  created_at: string;
  updated_at: string;
}

export interface RankingPlayer {
  pos: number;
  name: string;
  score: number;
  avatar: string;
  user_id?: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  prize: string;
  participants: number;
  timeLeft: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  category: string;
  status: 'active' | 'completed' | 'upcoming';
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
