
export interface MonthlyInvitePoints {
  id: string;
  user_id: string;
  month_year: string;
  invite_points: number;
  invites_count: number;
  active_invites_count: number;
  last_updated: string;
  created_at: string;
}

export interface MonthlyInviteCompetition {
  id: string;
  month_year: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'scheduled' | 'active' | 'completed';
  total_participants: number;
  total_prize_pool: number;
  created_at: string;
  updated_at: string;
}

export interface MonthlyInviteRanking {
  id: string;
  competition_id: string;
  user_id: string;
  username: string;
  position: number;
  invite_points: number;
  invites_count: number;
  active_invites_count: number;
  prize_amount: number;
  payment_status: string;
  pix_key?: string;
  pix_holder_name?: string;
}

export interface MonthlyInviteUserData {
  invite_points: number;
  invites_count: number;
  active_invites_count: number;
  month_year: string;
}

export interface MonthlyInviteStats {
  competition: MonthlyInviteCompetition | null;
  totalParticipants: number;
  totalPrizePool: number;
  topPerformers: any[];
  configuredPrizes?: Array<{
    position: number;
    prize_amount: number;
    active: boolean;
    description?: string;
  }>;
}
