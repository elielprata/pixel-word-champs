
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
  handleCellEndWithValidation
}: GameBoardGridProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const cellSize = getCellSize(size);

  return (
    <div 
      ref={boardRef}
      className="grid p-4 bg-white rounded-2xl shadow-lg mb-6"
      style={{ 
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: size > 7 ? '2px' : '4px',
        maxWidth: size > 7 ? '350px' : '320px',
        width: '100%',
        touchAction: 'none' // Previne zoom e outros gestos
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
          />
        ))
      )}
    </div>
  );
};

export default GameBoardGrid;
