
import { inviteCoreService } from './inviteCore';
import { inviteFriendsService } from './inviteFriends';
import { inviteStatsService } from './inviteStats';
import { inviteRewardsService } from './inviteRewards';

// Re-export types for backward compatibility
export type { Invite } from './inviteCore';
export type { InvitedFriend } from './inviteFriends';
export type { InviteReward } from './inviteRewards';

class InviteService {
  // Core invite operations
  async generateInviteCode() {
    return inviteCoreService.generateInviteCode();
  }

  async useInviteCode(code: string) {
    return inviteCoreService.useInviteCode(code);
  }

  async getUserInvites() {
    return inviteCoreService.getUserInvites();
  }

  // Friends management
  async getInvitedFriends() {
    return inviteFriendsService.getInvitedFriends();
  }

  // Statistics
  async getInviteStats() {
    return inviteStatsService.getInviteStats();
  }
}

export const inviteService = new InviteService();

// Export individual services for direct access if needed
export { inviteCoreService } from './inviteCore';
export { inviteFriendsService } from './inviteFriends';
export { inviteStatsService } from './inviteStats';
export { inviteRewardsService } from './inviteRewards';
