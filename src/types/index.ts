
// Tipos base do usuário
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  totalScore: number;
  gamesPlayed: number;
  bestDailyPosition?: number;
  bestWeeklyPosition?: number;
}

// Tipos do jogo
export interface GameConfig {
  level: number;
  timeLimit: number; // em segundos
  minWordLength: number;
  boardSize: number;
  targetWords?: string[];
  theme?: string;
}

export interface WordFound {
  word: string;
  points: number;
  positions: Position[];
  foundAt: string;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameSession {
  id: string;
  userId: string;
  challengeId?: string;
  level: number;
  board: string[][];
  wordsFound: WordFound[];
  totalScore: number;
  timeElapsed: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
}

// Tipos de competição
export interface Competition {
  id: string;
  type: 'daily' | 'weekly' | 'challenge';
  title: string;
  description: string;
  weekStart: string;
  weekEnd: string;
  isActive: boolean;
  totalParticipants: number;
  prizePool: number;
  prizeDistribution: PrizeDistribution[];
  createdAt: string;
}

export interface PrizeDistribution {
  position: number;
  amount: number;
  percentage: number;
}

export interface CompetitionParticipation {
  id: string;
  competitionId: string;
  userId: string;
  userPosition: number;
  userScore: number;
  prize?: number;
  paymentStatus: 'pending' | 'paid' | 'not_eligible';
  paymentDate?: string;
}

// Tipos de ranking
export interface RankingEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  position: number;
  gamesPlayed: number;
  lastActive: string;
}

export interface RankingData {
  daily: RankingEntry[];
  weekly: RankingEntry[];
  allTime: RankingEntry[];
  userPosition: {
    daily: number;
    weekly: number;
    allTime: number;
  };
}

// Tipos de convite
export interface InviteData {
  code: string;
  invitedBy: string;
  usedBy?: string;
  createdAt: string;
  usedAt?: string;
  isActive: boolean;
}

// Tipos de API - Corrigido para ter data opcional em caso de erro
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos de formulário
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

export interface UpdateProfileForm {
  username?: string;
  avatar?: File;
}

// Estados de loading
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface AsyncState<T> extends LoadingState {
  data?: T;
}
