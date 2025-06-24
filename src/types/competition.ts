
export interface UnifiedCompetition {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  maxParticipants: number;
  prizePool: number;
  theme?: string;
  weeklyTournamentId?: string;
  totalParticipants?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionFormData {
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  startDate: string;
  endDate: string;
  maxParticipants: number;
  weeklyTournamentId?: string;
}

export interface CompetitionValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CompetitionApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
