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
  pix_key?: string;
  pix_holder_name?: string;
  phone?: string; // Adicionar campo de telefone
  experience_points?: number; // Adicionar campo de XP
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
  description: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'completed' | 'scheduled';
  type: 'challenge' | 'daily' | 'weekly';
  competition_type: string; // Tornar obrigatório para compatibilidade
  prize_pool: number;
  max_participants?: number;
  total_participants: number;
  theme?: string;
  rules?: any;
  created_at: string;
  updated_at: string;
}

export interface CompetitionParticipation {
  id: string;
  competition_id: string;
  user_id: string;
  score: number;
  user_score?: number;
  position?: number;
  user_position?: number;
  joined_at: string;
  completed_at?: string;
  created_at?: string;
  payment_status?: 'pending' | 'paid' | 'failed' | 'not_eligible';
  prize?: number;
  payment_date?: string;
}

// Corrigir RankingPlayer para consistência com User
export interface RankingPlayer {
  pos: number;
  name: string;
  score: number;
  avatar_url?: string; // Alterado de 'avatar' para 'avatar_url'
  user_id: string; // Removido opcional - sempre necessário para comparações
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

// Tipos para game - Expandir Position interface
export interface Position {
  row: number;
  col: number;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  length?: number;
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
  competitionId?: string; // Adicionar competitionId como propriedade opcional
}

// Estados assíncronos
export interface AsyncState<T> {
  isLoading: boolean;
  error?: string;
  data?: T;
}

// Corrigir ApiResponse para ter tipos mais específicos
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
