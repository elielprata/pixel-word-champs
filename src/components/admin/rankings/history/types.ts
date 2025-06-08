
export interface CompetitionHistoryItem {
  id: string;
  title: string;
  competition_type: string;
  status: string;
  participants: number;
  prize_pool: number;
  start_date: string;
  end_date: string;
  source: 'system' | 'custom';
  theme?: string;
  created_at: string;
  updated_at: string;
  max_participants?: number;
  total_participants?: number;
}

export interface DebugInfo {
  customCompetitions: number;
  systemCompetitions: number;
  totalCompetitions: number;
  totalCustom: number;
  customError?: string;
  systemError?: string;
}
