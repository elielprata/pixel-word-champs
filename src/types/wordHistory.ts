
export interface WordUsageRecord {
  user_id: string;
  word: string;
  competition_id?: string;
  level: number;
  category: string;
  used_at: string;
}

export interface WordSelectionCriteria {
  userId: string;
  level: number;
  competitionId?: string;
  excludeCategories?: string[];
  maxWordsNeeded: number;
}

export interface WordWithMetadata {
  word: string;
  category: string;
  difficulty: string;
}
