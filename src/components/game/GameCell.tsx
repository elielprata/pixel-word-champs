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
  
  // NOVO: Tolerância menor no debounce e logs detalhados ---
  const touchMoveMinDistance = 2; // menos restritivo

  // Ajuste: remover negrito e diminuir fonte
  const getCellClasses = useMemo(() => {
    let base =
      "flex items-center justify-center font-medium relative transition-all duration-150 select-none " +
      "bg-white text-black";
    if (isSelected || isPermanent || isPreview || isHintHighlighted) {
      base += " ring-1 ring-gray-300";
    } else {
      base += " hover:bg-gray-100";
    }
    return base;
  }, [isSelected, isPermanent, isPreview, isHintHighlighted]);

  // Fonte menor, sem negrito
  const fontSize = isMobile
    ? Math.max(cellSize * 0.6, 16)
    : Math.max(cellSize * 0.7, 18); // Menor que antes

  const borderRadius = isMobile ? "5px" : "7px";
  const specialEffects = {};

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();

    if (!isMobile || !isSelecting) return;

    const touch = e.touches[0];
    if (!touch) return;

    // Debounce inteligente baseado em distância reduzida
    const currentPos = { x: touch.clientX, y: touch.clientY };
    const lastPos = lastTouchPositionRef.current;

    if (lastPos) {
      const distance = Math.sqrt(
        Math.pow(currentPos.x - lastPos.x, 2) + 
        Math.pow(currentPos.y - lastPos.y, 2)
      );
      if (distance < touchMoveMinDistance) {
        logger.debug('🔹 Touch ignorado (distância < tolerância)', { distance }, 'GAME_CELL');
        return;
      }
    }

    lastTouchPositionRef.current = currentPos;

    // Limpar timeout anterior
    if (touchMoveTimeoutRef.current) {
      clearTimeout(touchMoveTimeoutRef.current);
    }

    requestAnimationFrame(() => {
      logger.debug('📱 Touch move processado', { 
        clientX: touch.clientX, 
        clientY: touch.clientY,
        rowIndex,
        colIndex
      }, 'GAME_CELL');

      // Busca com fallback para melhor robustez
      let element = getCachedElement(touch.clientX, touch.clientY);
      if (!element) {
        element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
        logger.debug('⚠️ Buscou novamente via elementFromPoint', { element: element?.tagName }, 'GAME_CELL');
      }
      if (!element) return;

      let targetCell = element;
      let attempts = 0;
      const maxAttempts = 4;
      while (targetCell && !targetCell.hasAttribute('data-cell') && attempts < maxAttempts) {
        targetCell = targetCell.parentElement;
        attempts++;
      }
      if (targetCell && targetCell.hasAttribute('data-cell')) {
        const row = parseInt(targetCell.getAttribute('data-row') || '0');
        const col = parseInt(targetCell.getAttribute('data-col') || '0');
        logger.debug('✅ Célula encontrada via touch', { row, col, attempts }, 'GAME_CELL');
        onCellMove(row, col);
      } else {
        logger.debug('❌ Célula NÃO encontrada via touch', { element: element?.tagName, attempts }, 'GAME_CELL');
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
    logger.debug('🎯 Iniciou seleção', { 
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
        fontSize: `${fontSize}px`, // fonte menor
        background: "white",
        borderRadius,
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        padding: 0,
        margin: 0,
        boxShadow: "none",
        ...specialEffects
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        lastTouchPositionRef.current = null; // Reset posição
        logger.debug('📱 Touch start', { rowIndex, colIndex, isMobile, isPermanent }, 'GAME_CELL');
        handleCellStart();
      }}
      onTouchMove={handleTouchMove}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!isMobile) {
          logger.debug('🖱️ Mouse down', { rowIndex, colIndex }, 'GAME_CELL');
          handleCellStart();
        }
      }}
      onMouseEnter={handleMouseMove}
      data-cell="true"
      data-row={rowIndex}
      data-col={colIndex}
    >
      {/* Letra centralizada, sem negrito */}
      <span className="relative z-10 font-medium tracking-tight">{letter}</span>
    </div>
  );
};

export default GameCell;
