
export interface IndividualPrize {
  position: number;
  prize: number;
  id: string;
}

export interface GroupPrize {
  id: string;
  name: string;
  range: string;
  totalWinners: number;
  prizePerWinner: number;
  active: boolean;
}
