
import { useUsersQuery } from './useUsersQuery';
import { useUserMutations } from './useUserMutations';
import { useResetScores } from './useResetScores';

export type { AllUsersData } from './useUsersQuery';

export const useAllUsers = () => {
  const { data: usersList = [], isLoading, refetch } = useUsersQuery();
  const userMutations = useUserMutations();
  const resetScores = useResetScores();

  return {
    usersList,
    isLoading,
    refetch,
    ...userMutations,
    ...resetScores,
  };
};
