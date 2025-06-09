
import React, { useRef } from 'react';
import GameCell from './GameCell';
import { getCellSize, type Position } from '@/utils/boardUtils';

interface GameBoardGridProps {
  boardData: { board: string[][] };
  size: number;
  selectedCells: Position[];
  isSelecting: boolean;
  isCellSelected: (row: number, col: number) => boolean;
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
  isSelecting,
  isCellSelected,
  isCellPermanentlyMarked,
  isCellHintHighlighted,
  handleCellStart,
  handleCellMove,
  handleCellEndWithValidation,
  getWordColor,
  getCellWordIndex
}: GameBoardGridProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const cellSize = getCellSize(size);

  return (
    <div 
      ref={boardRef}
      className="grid mx-auto"
      style={{ 
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: size > 8 ? '2px' : '3px', // Espaçamento menor entre as células
        maxWidth: size > 8 ? '380px' : '360px',
        width: '100%',
        touchAction: 'none'
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleCellEndWithValidation();
      }}
      onMouseUp={(e) => {
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
            isPermanent={isCellPermanentlyMarked(rowIndex, colIndex)}
            isHintHighlighted={isCellHintHighlighted(rowIndex, colIndex)}
            cellSize={cellSize}
            onCellStart={handleCellStart}
            onCellMove={(row, col) => handleCellMove(row, col)}
            isSelecting={isSelecting}
            wordColorClass={isCellPermanentlyMarked(rowIndex, colIndex) 
              ? getWordColor(getCellWordIndex(rowIndex, colIndex))
              : undefined
            }
          />
        ))
      )}
    </div>
  );
};

export default GameBoardGrid;
