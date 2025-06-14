
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
      return `${wordColorClass} text-white shadow-lg animate-word-reveal border-2 border-white/20`;
    }
    if (isPermanent) {
      return 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg animate-word-reveal border-2 border-white/20';
    }
    if (isSelected) {
      return 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md border-2 border-white/30';
    }
    if (isHintHighlighted) {
      return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white animate-pulse shadow-md border-2 border-white/30';
    }
    return 'text-slate-700 bg-white/50 hover:bg-white/70 border border-slate-200/50';
  };

  // Função simplificada para iniciar seleção
  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    logger.debug('Célula selecionada (início)', { 
      rowIndex, 
      colIndex, 
      letter,
      isMobile 
    }, 'GAME_CELL');
    onCellStart(rowIndex, colIndex);
  }, [rowIndex, colIndex, letter, isMobile, onCellStart]);

  // Função simplificada para movimento
  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isSelecting) return;
    
    e.preventDefault();
    
    let targetElement;
    
    if ('touches' in e && e.touches[0]) {
      // Touch event
      const touch = e.touches[0];
      targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    } else {
      // Mouse event
      targetElement = e.target as Element;
    }
    
    // Encontrar a célula mais próxima
    let cellElement = targetElement;
    let attempts = 0;
    
    while (cellElement && !cellElement.hasAttribute('data-cell') && attempts < 5) {
      cellElement = cellElement.parentElement;
      attempts++;
    }
    
    if (cellElement && cellElement.hasAttribute('data-cell')) {
      const row = parseInt(cellElement.getAttribute('data-row') || '0');
      const col = parseInt(cellElement.getAttribute('data-col') || '0');
      
      logger.debug('Movimento detectado', { 
        from: { rowIndex, colIndex },
        to: { row, col },
        isMobile 
      }, 'GAME_CELL');
      
      onCellMove(row, col);
    }
  }, [rowIndex, colIndex, isSelecting, onCellMove, isMobile]);

  // Função para enter do mouse
  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    if (isSelecting && !isMobile) {
      onCellMove(rowIndex, colIndex);
    }
  }, [isSelecting, isMobile, onCellMove, rowIndex, colIndex]);

  // Estilos otimizados para mobile com formato oval
  const fontSize = isMobile ? 
    Math.max(cellSize * 0.45, 12) : 
    Math.max(cellSize * 0.5, 14);

  // Formato oval/cápsula mais pronunciado
  const borderRadius = isPermanent || isSelected ? '50%' : (isMobile ? '8px' : '10px');
  
  // Efeitos especiais para palavras encontradas
  const specialEffects = isPermanent ? {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  } : {};

  return (
    <div
      className={`
        flex items-center justify-center cursor-pointer
        transition-all duration-300 select-none font-bold relative
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
        WebkitTouchCallout: 'none',
        ...specialEffects
      }}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onMouseDown={handleStart}
      onMouseEnter={handleMouseEnter}
      data-cell="true"
      data-row={rowIndex}
      data-col={colIndex}
    >
      {/* Efeito de brilho interno para palavras encontradas */}
      {isPermanent && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none"
          style={{ borderRadius }}
        />
      )}
      
      {/* Letra */}
      <span className="relative z-10 font-extrabold tracking-tight">
        {letter}
      </span>
    </div>
  );
};

export default GameCell;
