
import React from 'react';

interface GameCellProps {
  letter: string;
  rowIndex: number;
  colIndex: number;
  isSelected: boolean;
  isPermanent: boolean;
  isHintHighlighted?: boolean;
  cellSize: number;
  onCellStart: (row: number, col: number) => void;
  onCellMove: (row: number, col: number) => void;
  isSelecting: boolean;
  wordColorClass?: string;
}

const GameCell = ({
  letter,
  rowIndex,
  colIndex,
  isSelected,
  isPermanent,
  isHintHighlighted = false,
  cellSize,
  onCellStart,
  onCellMove,
  isSelecting,
  wordColorClass
}: GameCellProps) => {
  const getLetterClasses = () => {
    if (isPermanent && wordColorClass) {
      return `text-transparent bg-gradient-to-br ${wordColorClass} bg-clip-text font-bold`;
    }
    if (isPermanent) {
      return 'text-transparent bg-gradient-to-br from-emerald-400 to-green-500 bg-clip-text font-bold';
    }
    if (isSelected) {
      return 'text-transparent bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text font-bold';
    }
    if (isHintHighlighted) {
      return 'text-transparent bg-gradient-to-br from-yellow-400 to-amber-500 bg-clip-text font-bold animate-pulse';
    }
    return 'text-slate-700 font-bold';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    const touch = e.touches[0];
    if (touch) {
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      
      let targetCell = element;
      
      while (targetCell && !targetCell.hasAttribute('data-cell')) {
        targetCell = targetCell.parentElement;
      }
      
      if (targetCell && targetCell.hasAttribute('data-cell')) {
        const row = parseInt(targetCell.getAttribute('data-row') || '0');
        const col = parseInt(targetCell.getAttribute('data-col') || '0');
        onCellMove(row, col);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting) {
      onCellMove(rowIndex, colIndex);
    }
  };

  return (
    <div
      className={`
        flex items-center justify-center cursor-pointer
        transition-all duration-300 select-none
        ${getLetterClasses()}
      `}
      style={{ 
        width: `${cellSize}px`, 
        height: `${cellSize}px`,
        fontSize: `${Math.max(cellSize * 0.5, 14)}px`,
        touchAction: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        onCellStart(rowIndex, colIndex);
      }}
      onTouchMove={handleTouchMove}
      onMouseDown={(e) => {
        e.preventDefault();
        onCellStart(rowIndex, colIndex);
      }}
      onMouseEnter={handleMouseMove}
      data-cell="true"
      data-row={rowIndex}
      data-col={colIndex}
    >
      {letter}
    </div>
  );
};

export default GameCell;
