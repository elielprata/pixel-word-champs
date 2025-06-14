
import React, { useCallback, useRef } from 'react';
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
  const touchMoveTimeoutRef = useRef<NodeJS.Timeout>();
  
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

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (!isMobile || !isSelecting) return;
    
    // Limpar timeout anterior
    if (touchMoveTimeoutRef.current) {
      clearTimeout(touchMoveTimeoutRef.current);
    }
    
    // Usar requestAnimationFrame para melhor performance
    requestAnimationFrame(() => {
      const touch = e.touches[0];
      if (!touch) return;
      
      logger.debug('📱 Touch move processado', { 
        clientX: touch.clientX, 
        clientY: touch.clientY,
        rowIndex,
        colIndex
      }, 'GAME_CELL');
      
      // Algoritmo otimizado para encontrar elemento
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      
      if (!element) return;
      
      // Buscar o elemento célula mais próximo
      let targetCell = element;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (targetCell && !targetCell.hasAttribute('data-cell') && attempts < maxAttempts) {
        targetCell = targetCell.parentElement;
        attempts++;
      }
      
      if (targetCell && targetCell.hasAttribute('data-cell')) {
        const row = parseInt(targetCell.getAttribute('data-row') || '0');
        const col = parseInt(targetCell.getAttribute('data-col') || '0');
        
        logger.debug('✅ Célula encontrada via touch', { row, col }, 'GAME_CELL');
        onCellMove(row, col);
      } else {
        logger.debug('⚠️ Célula não encontrada via touch', { 
          element: element?.tagName,
          attempts,
          hasDataCell: targetCell?.hasAttribute('data-cell')
        }, 'GAME_CELL');
      }
    });
  }, [isMobile, isSelecting, onCellMove, rowIndex, colIndex]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isSelecting && !isMobile) {
      logger.debug('🖱️ Mouse move detectado', { rowIndex, colIndex }, 'GAME_CELL');
      onCellMove(rowIndex, colIndex);
    }
  }, [isSelecting, isMobile, onCellMove, rowIndex, colIndex]);

  const handleCellStart = useCallback(() => {
    logger.debug('🎯 Célula iniciada', { 
      rowIndex, 
      colIndex, 
      letter,
      isMobile,
      isPermanent
    }, 'GAME_CELL');
    
    if (!isPermanent) {
      onCellStart(rowIndex, colIndex);
    }
  }, [rowIndex, colIndex, letter, isMobile, isPermanent, onCellStart]);

  // Estilos otimizados
  const fontSize = isMobile ? 
    Math.max(cellSize * 0.45, 12) : 
    Math.max(cellSize * 0.5, 14);

  const borderRadius = isPermanent || isSelected ? '50%' : (isMobile ? '8px' : '10px');
  
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
      onTouchStart={(e) => {
        e.preventDefault();
        logger.debug('📱 Touch start detectado', { 
          rowIndex, 
          colIndex,
          isMobile,
          isPermanent
        }, 'GAME_CELL');
        handleCellStart();
      }}
      onTouchMove={handleTouchMove}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!isMobile) {
          logger.debug('🖱️ Mouse down detectado', { rowIndex, colIndex }, 'GAME_CELL');
          handleCellStart();
        }
      }}
      onMouseEnter={handleMouseMove}
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
