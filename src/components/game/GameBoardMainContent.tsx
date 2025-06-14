
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

interface GameBoardMainContentProps {
  boardData: { board: string[][]; placedWords: any[] };
  size: number;
  selectedCells: Position[];
  previewCells: Position[];
  isSelecting: boolean;
  foundWords: FoundWord[];
  levelWords: string[];
  isCellSelected: (row: number, col: number) => boolean;
  isCellPreviewed: (row: number, col: number) => boolean;
  isCellPermanentlyMarked: (row: number, col: number) => boolean;
  isCellHintHighlighted: (row: number, col: number) => boolean;
  handleCellStart: (row: number, col: number) => void;
  handleCellMoveWithValidation: (row: number, col: number) => void;
  handleCellEndWithValidation: () => void;
  getWordColor: (wordIndex: number) => string;
  getCellWordIndex: (row: number, col: number) => number;
  selectionMetrics: any;
}

const GameBoardMainContent = ({
  boardData,
  size,
  selectedCells,
  previewCells,
  isSelecting,
  foundWords,
  levelWords,
  isCellSelected,
  isCellPreviewed,
  isCellPermanentlyMarked,
  isCellHintHighlighted,
  handleCellStart,
  handleCellMoveWithValidation,
  handleCellEndWithValidation,
  getWordColor,
  getCellWordIndex,
  selectionMetrics
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
          boardData={boardData}
          size={size}
          selectedCells={selectedCells}
          previewCells={previewCells}
          isSelecting={isSelecting}
          isCellSelected={isCellSelected}
          isCellPreviewed={isCellPreviewed}
          isCellPermanentlyMarked={isCellPermanentlyMarked}
          isCellHintHighlighted={isCellHintHighlighted}
          handleCellStart={handleCellStart}
          handleCellMove={handleCellMoveWithValidation}
          handleCellEndWithValidation={handleCellEndWithValidation}
          getWordColor={getWordColor}
          getCellWordIndex={getCellWordIndex}
        />
        
        {/* Indicador de métricas de seleção (debug) */}
        {process.env.NODE_ENV === 'development' && selectionMetrics && (
          <div className={`mt-2 text-xs text-slate-500 ${isMobile ? 'text-center' : ''}`}>
            Tentativas: {selectionMetrics.attempts} | 
            Sucessos: {selectionMetrics.successes} | 
            H: {selectionMetrics.horizontalAttempts} | 
            V: {selectionMetrics.verticalAttempts} | 
            D: {selectionMetrics.diagonalAttempts}
          </div>
        )}
      </div>

      {/* Lista de palavras sem scroll - layout flexível */}
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
