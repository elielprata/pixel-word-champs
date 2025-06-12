
import React from 'react';
import GameBoardGrid from './GameBoardGrid';
import WordsList from './WordsList';
import { type Position } from '@/utils/boardUtils';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface GameBoardMainContentProps {
  boardData: { board: string[][]; placedWords: any[] };
  size: number;
  selectedCells: Position[];
  isSelecting: boolean;
  foundWords: FoundWord[];
  levelWords: string[];
  isCellSelected: (row: number, col: number) => boolean;
  isCellPermanentlyMarked: (row: number, col: number) => boolean;
  isCellHintHighlighted: (row: number, col: number) => boolean;
  handleCellStart: (row: number, col: number) => void;
  handleCellMoveWithValidation: (row: number, col: number) => void;
  handleCellEndWithValidation: () => void;
  getWordColor: (wordIndex: number) => string;
  getCellWordIndex: (row: number, col: number) => number;
}

const GameBoardMainContent = ({
  boardData,
  size,
  selectedCells,
  isSelecting,
  foundWords,
  levelWords,
  isCellSelected,
  isCellPermanentlyMarked,
  isCellHintHighlighted,
  handleCellStart,
  handleCellMoveWithValidation,
  handleCellEndWithValidation,
  getWordColor,
  getCellWordIndex
}: GameBoardMainContentProps) => {
  return (
    <>
      {/* Tabuleiro principal */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30">
        <GameBoardGrid
          boardData={boardData}
          size={size}
          selectedCells={selectedCells}
          isSelecting={isSelecting}
          isCellSelected={isCellSelected}
          isCellPermanentlyMarked={isCellPermanentlyMarked}
          isCellHintHighlighted={isCellHintHighlighted}
          handleCellStart={handleCellStart}
          handleCellMove={handleCellMoveWithValidation}
          handleCellEndWithValidation={handleCellEndWithValidation}
          getWordColor={getWordColor}
          getCellWordIndex={getCellWordIndex}
        />
      </div>

      {/* Lista de palavras */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <WordsList 
          levelWords={levelWords}
          foundWords={foundWords}
          getWordColor={getWordColor}
        />
      </div>
    </>
  );
};

export default GameBoardMainContent;
