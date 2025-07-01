
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
      {/* Tabuleiro principal com design gamificado */}
      <div className={`
        relative bg-white/95 backdrop-blur-md rounded-xl shadow-xl border-2 border-white/40 overflow-hidden
        ${isMobile ? 'p-2' : 'p-3'}
      `}>
        {/* Gradiente de fundo sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30" />
        
        {/* Borda superior brilhante */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
        
        {/* Efeitos decorativos nos cantos */}
        <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
        <div className="absolute bottom-2 left-2 w-2 h-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-bounce" />
        
        <div className="relative z-10">
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
      </div>

      {/* Lista de palavras com design mais vibrante */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-xl shadow-lg border-2 border-white/40 overflow-hidden">
        {/* Gradiente de fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 to-purple-50/40" />
        
        {/* Borda superior colorida */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400" />
        
        <div className="relative z-10">
          <WordsList 
            levelWords={gameStateProps.levelWords}
            foundWords={gameStateProps.foundWords}
            getWordColor={cellInteractionProps.getWordColor}
          />
        </div>
      </div>
    </>
  );
};

export default GameBoardMainContent;
