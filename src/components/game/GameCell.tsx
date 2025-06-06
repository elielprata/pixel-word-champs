
import React from 'react';

interface GameCellProps {
  letter: string;
  rowIndex: number;
  colIndex: number;
  isSelected: boolean;
  isPermanent: boolean;
  cellSize: number;
  onCellStart: (row: number, col: number) => void;
  onCellMove: (row: number, col: number) => void;
  isSelecting: boolean;
}

const GameCell = ({
  letter,
  rowIndex,
  colIndex,
  isSelected,
  isPermanent,
  cellSize,
  onCellStart,
  onCellMove,
  isSelecting
}: GameCellProps) => {
  return (
    <div
      className={`
        flex items-center justify-center font-bold cursor-pointer
        transition-all duration-200 rounded-lg border-2
        ${isPermanent 
          ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-300 shadow-lg' 
          : isSelected
            ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white border-purple-300 shadow-lg scale-110' 
            : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-200 hover:border-purple-300 hover:scale-105'
        }
      `}
      style={{ 
        width: `${cellSize}px`, 
        height: `${cellSize}px`,
        fontSize: `${Math.max(cellSize * 0.35, 10)}px`
      }}
      onTouchStart={() => onCellStart(rowIndex, colIndex)}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const cell = element?.closest('[data-cell]');
        if (cell) {
          const row = parseInt(cell.getAttribute('data-row') || '0');
          const col = parseInt(cell.getAttribute('data-col') || '0');
          onCellMove(row, col);
        }
      }}
      onMouseDown={() => onCellStart(rowIndex, colIndex)}
      onMouseEnter={() => isSelecting && onCellMove(rowIndex, colIndex)}
      data-cell
      data-row={rowIndex}
      data-col={colIndex}
    >
      {letter}
    </div>
  );
};

export default GameCell;
