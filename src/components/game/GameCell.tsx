
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

  // Função para iniciar seleção
  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    logger.debug('EVENTO: Célula selecionada (início)', { 
      rowIndex, 
      colIndex, 
      letter,
      isMobile,
      eventType: 'touches' in e ? 'touch' : 'mouse'
    }, 'GAME_CELL');
    onCellStart(rowIndex, colIndex);
  }, [rowIndex, colIndex, letter, isMobile, onCellStart]);

  // Função melhorada para movimento com detecção robusta
  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isSelecting) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    let clientX: number, clientY: number;
    
    if ('touches' in e && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }
    
    logger.debug('EVENTO: Movimento detectado', { 
      coordinates: { clientX, clientY },
      currentCell: { rowIndex, colIndex },
      eventType: 'touches' in e ? 'touch' : 'mouse'
    }, 'GAME_CELL');
    
    // Detecção robusta do elemento alvo
    let targetElement = document.elementFromPoint(clientX, clientY);
    
    if (!targetElement) {
      logger.warn('EVENTO: Nenhum elemento encontrado nas coordenadas', { 
        clientX, clientY 
      }, 'GAME_CELL');
      return;
    }
    
    // Buscar célula mais próxima com fallback robusto
    let cellElement = targetElement;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (cellElement && !cellElement.hasAttribute('data-cell') && attempts < maxAttempts) {
      cellElement = cellElement.parentElement;
      attempts++;
    }
    
    if (cellElement && cellElement.hasAttribute('data-cell')) {
      const row = parseInt(cellElement.getAttribute('data-row') || '0');
      const col = parseInt(cellElement.getAttribute('data-col') || '0');
      
      logger.debug('EVENTO: Célula alvo encontrada', { 
        from: { rowIndex, colIndex },
        to: { row, col },
        attempts,
        elementFound: true
      }, 'GAME_CELL');
      
      onCellMove(row, col);
    } else {
      logger.warn('EVENTO: Célula alvo não encontrada', { 
        attempts,
        maxAttempts,
        targetElementTag: targetElement.tagName,
        targetElementClass: targetElement.className
      }, 'GAME_CELL');
      
      // Fallback: usar coordenadas para tentar detectar célula próxima
      const cells = document.querySelectorAll('[data-cell="true"]');
      let closestCell: Element | null = null;
      let minDistance = Infinity;
      
      cells.forEach(cell => {
        const rect = cell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestCell = cell;
        }
      });
      
      if (closestCell && minDistance < cellSize) {
        const row = parseInt(closestCell.getAttribute('data-row') || '0');
        const col = parseInt(closestCell.getAttribute('data-col') || '0');
        
        logger.debug('EVENTO: Célula encontrada por proximidade', { 
          from: { rowIndex, colIndex },
          to: { row, col },
          distance: minDistance,
          cellSize
        }, 'GAME_CELL');
        
        onCellMove(row, col);
      }
    }
  }, [rowIndex, colIndex, isSelecting, onCellMove, cellSize]);

  // Função para enter do mouse (apenas desktop)
  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    if (isSelecting && !isMobile) {
      logger.debug('EVENTO: Mouse enter durante seleção', { 
        rowIndex, 
        colIndex 
      }, 'GAME_CELL');
      onCellMove(rowIndex, colIndex);
    }
  }, [isSelecting, isMobile, onCellMove, rowIndex, colIndex]);

  // Estilos otimizados com correções CSS (item 4)
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
        pointerEvents: 'auto', // Garantir que eventos funcionem
        zIndex: 1, // Evitar sobreposições
        ...specialEffects
      }}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
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
      
      {/* Debug visual para seleção */}
      {isSelected && (
        <div 
          className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full pointer-events-none opacity-75"
          style={{ zIndex: 10 }}
        />
      )}
    </div>
  );
};

export default GameCell;
