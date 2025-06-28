
export interface MonthlyInviteData {
  userPoints: {
    invite_points: number;
    invites_count: number;
    active_invites_count: number;
    month_year: string;
  };
  competition: any;
  rankings: any[];
  userPosition: any;
  stats: {
    totalParticipants: number;
    totalPrizePool: number;
    topPerformers: any[];
  };
}

export interface UseMonthlyInviteCompetitionReturn {
  data: MonthlyInviteData | null;
  isLoading: boolean;
  error: string | null;
  refreshRanking: () => Promise<any>;
  refetch: () => Promise<void>;
}
