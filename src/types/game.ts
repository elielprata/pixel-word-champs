
export interface GameCell {
  row: number;
  col: number;
  letter: string;
  isSelected?: boolean;
  isPermanentlyMarked?: boolean;
  isHintHighlighted?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface FoundWord {
  word: string;
  points: number;
  positions: Position[];
}

export interface GameState {
  selectedCells: GameCell[];
  foundWords: FoundWord[];
  score: number;
  timeLeft: number;
  gameStatus: 'playing' | 'paused' | 'completed' | 'failed';
  currentWord: string;
  isSelecting: boolean;
  permanentlyMarkedCells: GameCell[];
  hintHighlightedCells: GameCell[];
  hintsUsed: number;
  showGameOver?: boolean;
  showLevelComplete?: boolean;
}

export interface GameStateProps {
  foundWords: FoundWord[];
  levelWords: string[];
  hintsUsed: number;
  currentLevelScore: number;
}
