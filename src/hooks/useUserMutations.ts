
import { useBanUserMutation } from './useBanUserMutation';
import { useDeleteUserMutation } from './useDeleteUserMutation';
import { useUnbanUserMutation } from './useUnbanUserMutation';

export const useUserMutations = () => {
  const { banUser, isBanningUser } = useBanUserMutation();
  const { deleteUser, isDeletingUser } = useDeleteUserMutation();
  const { unbanUser, isUnbanningUser } = useUnbanUserMutation();

  return {
    banUser,
    deleteUser,
    unbanUser,
    isBanningUser,
    isDeletingUser,
    isUnbanningUser,
  };
};
