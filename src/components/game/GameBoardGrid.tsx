import React, { useRef } from 'react';
import GameCell from './GameCell';
import { getCellSize, getBoardWidth, getMobileBoardWidth, type Position } from '@/utils/boardUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { logger } from '@/utils/logger';

interface GameBoardGridProps {
  boardData: { board: string[][] };
  size: number; // altura (12)
  selectedCells: Position[];
  previewCells: Position[];
  isSelecting: boolean;
  isCellSelected: (row: number, col: number) => boolean;
  isCellPreviewed: (row: number, col: number) => boolean;
  isCellPermanentlyMarked: (row: number, col: number) => boolean;
  isCellHintHighlighted: (row: number, col: number) => boolean;
  handleCellStart: (row: number, col: number) => void;
  handleCellMove: (row: number, col: number) => void;
  handleCellEndWithValidation: () => void;
  getWordColor: (wordIndex: number) => string;
  getCellWordIndex: (row: number, col: number) => number;
}

const GameBoardGrid = ({
  boardData,
  size,
  selectedCells,
  previewCells,
  isSelecting,
  isCellSelected,
  isCellPreviewed,
  isCellPermanentlyMarked,
  isCellHintHighlighted,
  handleCellStart,
  handleCellMove,
  handleCellEndWithValidation,
  getWordColor,
  getCellWordIndex
}: GameBoardGridProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const cellSize = getCellSize(size, isMobile);
  const boardWidth = isMobile ? getMobileBoardWidth(1) : getBoardWidth(1);

  // VISUAL ULTRA LIMPO PARA FASE 2:
  const gridConfig = {
    gap: '1px', // minúsculo para leve respiro das células
    maxWidth: isMobile ? '340px' : '400px',
    padding: '0px'
  };

  return (
    <div
      ref={boardRef}
      className="grid mx-auto bg-white"
      style={{
        gridTemplateColumns: `repeat(${boardWidth}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`,
        gap: gridConfig.gap,
        maxWidth: gridConfig.maxWidth,
        width: '100%',
        touchAction: 'none',
        padding: gridConfig.padding,
        background: "white"
      }}
      onTouchEnd={e => {
        e.preventDefault();
        handleCellEndWithValidation();
      }}
      onMouseUp={e => {
        e.preventDefault();
        handleCellEndWithValidation();
      }}
    >
      {boardData.board.map((row, rowIndex) =>
        row.map((letter, colIndex) => (
          <GameCell
            key={`${rowIndex}-${colIndex}`}
            letter={letter}
            rowIndex={rowIndex}
            colIndex={colIndex}
            isSelected={isCellSelected(rowIndex, colIndex)}
            isPreview={isCellPreviewed(rowIndex, colIndex)}
            isPermanent={isCellPermanentlyMarked(rowIndex, colIndex)}
            isHintHighlighted={isCellHintHighlighted(rowIndex, colIndex)}
            cellSize={cellSize}
            onCellStart={handleCellStart}
            onCellMove={handleCellMove}
            isSelecting={isSelecting}
            isMobile={isMobile}
            wordColorClass={undefined}
          />
        ))
      )}
    </div>
  );
};

export default GameBoardGrid;
