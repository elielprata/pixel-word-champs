
import { IndividualPrize, GroupPrize } from '@/types/payment';

export const usePrizeCalculations = () => {
  const calculateTotalPrize = (individualPrizes: IndividualPrize[], groupPrizes: GroupPrize[]) => {
    const individualTotal = individualPrizes.reduce((total, prize) => total + prize.prize, 0);
    const groupTotal = groupPrizes
      .filter(group => group.active)
      .reduce((total, group) => total + (group.totalWinners * group.prizePerWinner), 0);
    return individualTotal + groupTotal;
  };

  const calculateTotalWinners = (individualPrizes: IndividualPrize[], groupPrizes: GroupPrize[]) => {
    const individualWinners = individualPrizes.length;
    const groupWinners = groupPrizes
      .filter(group => group.active)
      .reduce((total, group) => total + group.totalWinners, 0);
    return individualWinners + groupWinners;
  };

  return {
    calculateTotalPrize,
    calculateTotalWinners
  };
};
