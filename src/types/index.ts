
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
  board: string[][];
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

export interface CompetitionParticipation {
  id: string;
  competition_id: string;
  user_id: string;
  user_position: number;
  user_score: number;
  prize?: number;
  payment_status: 'pending' | 'paid' | 'not_eligible';
  payment_date?: string;
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

// Formulários de autenticação
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode?: string;
}

// Tipos para game
export interface Position {
  row: number;
  col: number;
}

export interface WordFound {
  word: string;
  points: number;
  positions: Position[];
  foundAt: string;
}

export interface GameConfig {
  level: number;
  boardSize?: number;
  timeLimit?: number;
}

// Estados assíncronos
export interface AsyncState<T> {
  isLoading: boolean;
  error?: string;
  data?: T;
}

// Respostas da API - CORRIGIDO: data sempre presente, null quando erro
export interface ApiResponse<T> {
  data: T | null;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
