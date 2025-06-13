
import { useState } from 'react';

export const useRankingPagination = () => {
  const [dailyLimit, setDailyLimit] = useState(20);
  const [weeklyLimit, setWeeklyLimit] = useState(20);

  const loadMoreDaily = () => {
    if (dailyLimit < 100) {
      setDailyLimit(prev => Math.min(prev + 20, 100));
    }
  };

  const loadMoreWeekly = () => {
    if (weeklyLimit < 100) {
      setWeeklyLimit(prev => Math.min(prev + 20, 100));
    }
  };

  const canLoadMoreDaily = (totalItems: number) => {
    return dailyLimit < 100 && totalItems > dailyLimit;
  };

  const canLoadMoreWeekly = (totalItems: number) => {
    return weeklyLimit < 100 && totalItems > weeklyLimit;
  };

  return {
    dailyLimit,
    weeklyLimit,
    loadMoreDaily,
    loadMoreWeekly,
    canLoadMoreDaily,
    canLoadMoreWeekly
  };
};
