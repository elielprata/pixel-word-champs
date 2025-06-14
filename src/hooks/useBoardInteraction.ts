
import { useState, useCallback } from 'react';
import { type Position } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

export const useBoardInteraction = () => {
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleCellStart = useCallback((row: number, col: number) => {
    logger.debug('🎯 Iniciando seleção de célula', { row, col }, 'BOARD_INTERACTION');
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  }, []);

  const handleCellMove = useCallback((row: number, col: number, isInLineWithSelection: (newPosition: Position, selectedPositions: Position[]) => boolean) => {
    if (!isSelecting) return;
    
    const newPosition = { row, col };
    
    setSelectedCells(prev => {
      if (prev.length === 0) return [newPosition];
      
      // Verificar se a nova posição já está selecionada
      const isAlreadySelected = prev.some(p => p.row === row && p.col === col);
      if (isAlreadySelected) {
        logger.debug('⚠️ Posição já selecionada', { row, col }, 'BOARD_INTERACTION');
        return prev;
      }
      
      // Para seleção de 2+ células, verificar se está em linha reta
      if (prev.length >= 1) {
        if (!isInLineWithSelection(newPosition, prev)) {
          logger.debug('❌ Posição fora da linha reta', { 
            newPosition,
            currentSelection: prev.length,
            firstPos: prev[0],
            lastPos: prev[prev.length - 1]
          }, 'BOARD_INTERACTION');
          return prev;
        }
      }
      
      const newPath = [...prev, newPosition];
      logger.debug('✅ Adicionando posição à seleção', { 
        newPosition,
        pathLength: newPath.length 
      }, 'BOARD_INTERACTION');
      
      return newPath;
    });
  }, [isSelecting]);

  const handleCellEnd = useCallback(() => {
    logger.debug('🏁 Finalizando seleção', { 
      selectedCellsCount: selectedCells.length,
      hasSelection: selectedCells.length > 0
    }, 'BOARD_INTERACTION');
    
    setIsSelecting(false);
    const finalSelection = [...selectedCells];
    setSelectedCells([]);
    
    // Log da seleção final
    if (finalSelection.length > 0) {
      logger.debug('📝 Seleção finalizada', {
        length: finalSelection.length,
        start: finalSelection[0],
        end: finalSelection[finalSelection.length - 1],
        positions: finalSelection
      }, 'BOARD_INTERACTION');
    }
    
    return finalSelection;
  }, [selectedCells]);

  const isCellSelected = useCallback((row: number, col: number) => {
    return selectedCells.some(pos => pos.row === row && pos.col === col);
  }, [selectedCells]);

  return {
    selectedCells,
    isSelecting,
    handleCellStart,
    handleCellMove,
    handleCellEnd,
    isCellSelected
  };
};
