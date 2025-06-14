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
  
  // APARÊNCIA MINIMALISTA: célula sem quadrante, só letra centralizada e grande
  const getCellClasses = useMemo(() => {
    let base =
      "flex items-center justify-center font-bold relative transition-all duration-200 select-none " +
      "bg-white text-gray-900 " +
      (isSelected || isPermanent || isPreview || isHintHighlighted
        ? "outline-none ring-2 ring-primary/50"
        : "hover:bg-gray-50");

    // Remove bordas, sombras, gradientes explícitos!
    return base;
  }, [isSelected, isPermanent, isPreview, isHintHighlighted]);

  // Tamanho da fonte e célula para dar destaque à letra
  const fontSize = isMobile
    ? Math.max(cellSize * 0.75, 18)
    : Math.max(cellSize * 0.80, 22);

  // Bordas sempre arredondadas pequenas, NÃO em círculo/quadrante
  const borderRadius = isMobile ? "6px" : "8px";

  // Nenhum efeito especial (sombras/gradientes) para célula
  const specialEffects = {};

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

  return (
    <div
      className={getCellClasses}
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        fontSize: `${fontSize}px`,
        background: "white",
        borderRadius,
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        padding: 0,
        margin: 0,
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
