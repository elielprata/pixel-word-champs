
import React, { useCallback, useRef, useMemo } from 'react';
import { logger } from '@/utils/logger';

interface GameCellProps {
  letter: string;
  rowIndex: number;
  colIndex: number;
  isSelected: boolean;
  isPermanent: boolean;
  isHintHighlighted?: boolean;
  isPreview?: boolean;
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
  isPreview = false,
  cellSize,
  onCellStart,
  onCellMove,
  isSelecting,
  isMobile = false,
  wordColorClass
}: GameCellProps) => {
  const touchMoveTimeoutRef = useRef<NodeJS.Timeout>();
  const elementCacheRef = useRef<Map<string, HTMLElement>>(new Map());
  const lastTouchPositionRef = useRef<{x: number, y: number} | null>(null);
  
  // Cache otimizado de elementos para melhor performance
  const getCachedElement = useCallback((x: number, y: number): HTMLElement | null => {
    const cacheKey = `${Math.round(x)}-${Math.round(y)}`;
    
    if (elementCacheRef.current.has(cacheKey)) {
      return elementCacheRef.current.get(cacheKey) || null;
    }
    
    const element = document.elementFromPoint(x, y) as HTMLElement;
    if (element) {
      elementCacheRef.current.set(cacheKey, element);
      
      // Limitar cache size
      if (elementCacheRef.current.size > 100) {
        const firstKey = elementCacheRef.current.keys().next().value;
        elementCacheRef.current.delete(firstKey);
      }
    }
    
    return element;
  }, []);
  
  const getCellClasses = useMemo(() => {
    if (isPermanent && wordColorClass) {
      return `${wordColorClass} text-white shadow-lg animate-word-reveal border-2 border-white/20`;
    }
    if (isPermanent) {
      return 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg animate-word-reveal border-2 border-white/20';
    }
    if (isSelected) {
      return 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md border-2 border-white/30 scale-105';
    }
    if (isPreview) {
      return 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-sm border-2 border-white/40 opacity-80';
    }
    if (isHintHighlighted) {
      return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white animate-pulse shadow-md border-2 border-white/30';
    }
    return 'text-slate-700 bg-white/50 hover:bg-white/70 border border-slate-200/50 hover:scale-102';
  }, [isPermanent, isSelected, isPreview, isHintHighlighted, wordColorClass]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (!isMobile || !isSelecting) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    // Debounce inteligente baseado em distância
    const currentPos = { x: touch.clientX, y: touch.clientY };
    const lastPos = lastTouchPositionRef.current;
    
    if (lastPos) {
      const distance = Math.sqrt(
        Math.pow(currentPos.x - lastPos.x, 2) + 
        Math.pow(currentPos.y - lastPos.y, 2)
      );
      
      // Só processar se moveu pelo menos 5px
      if (distance < 5) return;
    }
    
    lastTouchPositionRef.current = currentPos;
    
    // Limpar timeout anterior
    if (touchMoveTimeoutRef.current) {
      clearTimeout(touchMoveTimeoutRef.current);
    }
    
    // Usar requestAnimationFrame para melhor performance
    requestAnimationFrame(() => {
      logger.debug('📱 Touch move otimizado processado', { 
        clientX: touch.clientX, 
        clientY: touch.clientY,
        rowIndex,
        colIndex
      }, 'GAME_CELL');
      
      // Algoritmo otimizado para encontrar elemento com cache
      const element = getCachedElement(touch.clientX, touch.clientY);
      
      if (!element) return;
      
      // Buscar o elemento célula mais próximo
      let targetCell = element;
      let attempts = 0;
      const maxAttempts = 3; // Reduzido para melhor performance
      
      while (targetCell && !targetCell.hasAttribute('data-cell') && attempts < maxAttempts) {
        targetCell = targetCell.parentElement;
        attempts++;
      }
      
      if (targetCell && targetCell.hasAttribute('data-cell')) {
        const row = parseInt(targetCell.getAttribute('data-row') || '0');
        const col = parseInt(targetCell.getAttribute('data-col') || '0');
        
        logger.debug('✅ Célula encontrada via touch otimizado', { 
          row, 
          col,
          attempts,
          cached: elementCacheRef.current.size
        }, 'GAME_CELL');
        onCellMove(row, col);
      } else {
        logger.debug('⚠️ Célula não encontrada via touch', { 
          element: element?.tagName,
          attempts,
          hasDataCell: targetCell?.hasAttribute('data-cell')
        }, 'GAME_CELL');
      }
    });
  }, [isMobile, isSelecting, onCellMove, rowIndex, colIndex, getCachedElement]);

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
      isPermanent,
      isSelected,
      isPreview
    }, 'GAME_CELL');
    
    if (!isPermanent) {
      onCellStart(rowIndex, colIndex);
    }
  }, [rowIndex, colIndex, letter, isMobile, isPermanent, isSelected, isPreview, onCellStart]);

  // Estilos otimizados
  const fontSize = isMobile ? 
    Math.max(cellSize * 0.45, 12) : 
    Math.max(cellSize * 0.5, 14);

  const borderRadius = isPermanent || isSelected || isPreview ? '50%' : (isMobile ? '8px' : '10px');
  
  const specialEffects = useMemo(() => {
    if (isPermanent) {
      return {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      };
    }
    if (isSelected) {
      return {
        transform: 'scale(1.1)',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      };
    }
    if (isPreview) {
      return {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      };
    }
    return {};
  }, [isPermanent, isSelected, isPreview]);

  return (
    <div
      className={`
        flex items-center justify-center cursor-pointer
        transition-all duration-200 select-none font-bold relative
        ${isMobile ? 'active:scale-95' : 'hover:scale-105'}
        ${getCellClasses}
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
        lastTouchPositionRef.current = null; // Reset posição
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
      
      {/* Indicador visual para preview */}
      {isPreview && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none animate-pulse"
          style={{ borderRadius }}
        />
      )}
      
      {/* Letra */}
      <span className="relative z-10 font-extrabold tracking-tight">
        {letter}
      </span>
      
      {/* Feedback visual adicional para seleções */}
      {(isSelected || isPreview) && (
        <div 
          className="absolute -inset-1 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-full animate-ping"
          style={{ 
            animationDuration: isSelected ? '1s' : '2s',
            animationIterationCount: isSelected ? 'infinite' : '1'
          }}
        />
      )}
    </div>
  );
};

export default GameCell;
