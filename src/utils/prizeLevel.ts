
export const getValidPositions = (level: string): number[] => {
  switch (level) {
    case '1º Lugar':
      return [1];
    case 'Top 3':
      return [1, 2, 3];
    case 'Top 5':
      return [1, 2, 3, 4, 5];
    case 'Top 10':
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    case 'Top 20':
      return Array.from({ length: 20 }, (_, i) => i + 1);
    default:
      return [];
  }
};

export const getWinnersForPrizeLevel = (winners: any[], level: string): any[] => {
  const validPositions = getValidPositions(level);
  return winners.filter(winner => validPositions.includes(winner.position));
};
