
import React from 'react';
import GameBoardGrid from './GameBoardGrid';
import WordsList from './WordsList';
import { useIsMobile } from '@/hooks/use-mobile';
import { type Position } from '@/utils/boardUtils';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface BoardProps {
  boardData: { board: string[][]; placedWords: any[] };
  size: number;
  selectedCells: Position[];
  isDragging: boolean;
}

interface GameStateProps {
  foundWords: FoundWord[];
  levelWords: string[];
  hintsUsed: number;
  currentLevelScore: number;
}

interface CellInteractionProps {
  handleCellStart: (row: number, col: number) => void;
  handleCellMove: (row: number, col: number) => void;
  handleCellEnd: () => void;
  isCellSelected: (row: number, col: number) => boolean;
  isCellPermanentlyMarked: (row: number, col: number) => boolean;
  isCellHintHighlighted: (row: number, col: number) => boolean;
  getWordColor: (wordIndex: number) => string;
  getCellWordIndex: (row: number, col: number) => number;
}

interface GameBoardMainContentProps {
  boardProps: BoardProps;
  gameStateProps: GameStateProps;
  cellInteractionProps: CellInteractionProps;
}

const GameBoardMainContent = ({
  boardProps,
  gameStateProps,
  cellInteractionProps
}: GameBoardMainContentProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Tabuleiro principal com layout otimizado para mobile */}
      <div className={`
        bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30
        ${isMobile ? 'p-3' : 'p-6'}
      `}>
        <GameBoardGrid
          boardData={boardProps.boardData}
          size={boardProps.size}
          selectedCells={boardProps.selectedCells}
          isDragging={boardProps.isDragging}
          isCellSelected={cellInteractionProps.isCellSelected}
          isCellPermanentlyMarked={cellInteractionProps.isCellPermanentlyMarked}
          isCellHintHighlighted={cellInteractionProps.isCellHintHighlighted}
          handleCellStart={cellInteractionProps.handleCellStart}
          handleCellMove={cellInteractionProps.handleCellMove}
          handleCellEnd={cellInteractionProps.handleCellEnd}
          getWordColor={cellInteractionProps.getWordColor}
          getCellWordIndex={cellInteractionProps.getCellWordIndex}
        />
      </div>

      {/* Lista de palavras sem scroll - layout flexível */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <WordsList 
          levelWords={gameStateProps.levelWords}
          foundWords={gameStateProps.foundWords}
          getWordColor={cellInteractionProps.getWordColor}
        />
      </div>
    </>
  );
};

export default GameBoardMainContent;
