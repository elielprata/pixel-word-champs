
import React, { useCallback } from 'react';
import { logger } from '@/utils/logger';

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
  isMobile?: boolean;
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
  isMobile = false,
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

  // Debounced touch move para melhor performance em mobile
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (!isMobile) return;
    
    const touch = e.touches[0];
    if (touch) {
      logger.debug('Touch move detectado', { 
        clientX: touch.clientX, 
        clientY: touch.clientY,
        rowIndex,
        colIndex
      }, 'GAME_CELL');
      
      // Melhor detecção de elemento em mobile
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      
      let targetCell = element;
      let attempts = 0;
      const maxAttempts = 5;
      
      // Buscar o elemento célula com limite de tentativas
      while (targetCell && !targetCell.hasAttribute('data-cell') && attempts < maxAttempts) {
        targetCell = targetCell.parentElement;
        attempts++;
      }
      
      if (targetCell && targetCell.hasAttribute('data-cell')) {
        const row = parseInt(targetCell.getAttribute('data-row') || '0');
        const col = parseInt(targetCell.getAttribute('data-col') || '0');
        
        logger.debug('Célula encontrada via touch', { row, col }, 'GAME_CELL');
        onCellMove(row, col);
      } else {
        logger.warn('Célula não encontrada via touch', { 
          element: element?.tagName,
          attempts 
        }, 'GAME_CELL');
      }
    }
  }, [isMobile, onCellMove, rowIndex, colIndex]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting && !isMobile) {
      onCellMove(rowIndex, colIndex);
    }
  };

  const handleCellStart = () => {
    logger.debug('Célula selecionada', { 
      rowIndex, 
      colIndex, 
      letter,
      isMobile 
    }, 'GAME_CELL');
    onCellStart(rowIndex, colIndex);
  };

  // Estilos otimizados para mobile
  const fontSize = isMobile ? 
    Math.max(cellSize * 0.45, 12) : 
    Math.max(cellSize * 0.5, 14);

  const borderRadius = isMobile ? '6px' : '8px';

  return (
    <div
      className={`
        flex items-center justify-center cursor-pointer
        transition-all duration-200 select-none font-bold
        ${isMobile ? 'active:scale-95' : 'hover:scale-105'}
        ${getCellClasses()}
      `}
      style={{ 
        width: `${cellSize}px`, 
        height: `${cellSize}px`,
        fontSize: `${fontSize}px`,
        touchAction: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        logger.debug('Touch start detectado', { 
          rowIndex, 
          colIndex,
          isMobile 
        }, 'GAME_CELL');
        handleCellStart();
      }}
      onTouchMove={handleTouchMove}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!isMobile) {
          handleCellStart();
        }
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
