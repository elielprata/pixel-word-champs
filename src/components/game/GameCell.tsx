
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
  isSelecting
}: GameCellProps) => {
  const getCellClasses = () => {
    if (isPermanent) {
      return 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-300 shadow-lg';
    }
    if (isSelected) {
      return 'bg-gradient-to-br from-purple-500 to-blue-500 text-white border-purple-300 shadow-lg scale-110';
    }
    if (isHintHighlighted) {
      return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white border-yellow-300 shadow-lg animate-pulse';
    }
    return 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-200 hover:border-purple-300 hover:scale-105';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Previne scroll durante seleção
    
    const touch = e.touches[0];
    if (touch) {
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      
      // Verificar se é uma célula válida
      let targetCell = element;
      
      // Se não encontrou uma célula, procurar nos elementos pais
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
      // Para mouse, usar as coordenadas do elemento atual
      onCellMove(rowIndex, colIndex);
    }
  };

  return (
    <div
      className={`
        flex items-center justify-center font-bold cursor-pointer
        transition-all duration-200 rounded-lg border-2 select-none
        ${getCellClasses()}
      `}
      style={{ 
        width: `${cellSize}px`, 
        height: `${cellSize}px`,
        fontSize: `${Math.max(cellSize * 0.35, 10)}px`,
        touchAction: 'none' // Importante para prevenir comportamentos padrão do touch
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
