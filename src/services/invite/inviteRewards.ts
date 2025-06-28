
export interface InviteReward {
  id: string;
  user_id: string;
  invited_user_id: string;
  invite_code: string;
  reward_amount: number;
  status: string;
  created_at: string;
  processed_at?: string;
}

class InviteRewardsService {
  // This service can be extended in the future for reward management
  // Currently, rewards are handled in the core service
}

export const inviteRewardsService = new InviteRewardsService();
