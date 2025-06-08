
import { useQuery } from '@tanstack/react-query';
import { useUsersQuery, AllUsersData } from './useUsersQuery';
import { useUserMutations } from './useUserMutations';
import { useResetScores } from './useResetScores';

export const useAllUsers = () => {
  const { data: usersList = [], isLoading, refetch } = useUsersQuery();
  const { banUser, deleteUser, unbanUser, isBanningUser, isDeletingUser, isUnbanningUser } = useUserMutations();
  const { resetAllScores, isResettingScores } = useResetScores();

  return {
    usersList,
    isLoading,
    refetch,
    banUser,
    deleteUser,
    unbanUser,
    isBanningUser,
    isDeletingUser,
    isUnbanningUser,
    resetAllScores,
    isResettingScores,
  };
};

export type { AllUsersData };
