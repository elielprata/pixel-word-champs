
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
  const getCellClasses = () => {
    if (isPermanent && wordColorClass) {
      return `bg-gradient-to-br ${wordColorClass} text-white rounded-lg`;
    }
    if (isPermanent) {
      return 'bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-lg';
    }
    if (isSelected) {
      return 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg';
    }
    if (isHintHighlighted) {
      return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-lg animate-pulse';
    }
    return 'text-slate-700';
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
        transition-all duration-300 select-none font-bold
        ${getCellClasses()}
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
