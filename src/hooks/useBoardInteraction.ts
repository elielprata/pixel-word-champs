
import { useState, useCallback } from 'react';
import { type Position } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

export const useBoardInteraction = () => {
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleCellStart = useCallback((row: number, col: number) => {
    logger.debug('Iniciando seleção de célula', { row, col }, 'BOARD_INTERACTION');
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  }, []);

  const handleCellMove = useCallback((row: number, col: number, isValidWordDirection?: (positions: Position[]) => boolean) => {
    if (!isSelecting) return;
    
    const newPosition = { row, col };
    setSelectedCells(prev => {
      if (prev.length === 0) return [newPosition];
      
      // Verificar se a nova posição já está selecionada
      const isAlreadySelected = prev.some(p => p.row === row && p.col === col);
      if (isAlreadySelected) {
        return prev;
      }
      
      const newPath = [...prev, newPosition];
      
      // Se há validação de direção, aplicá-la
      if (isValidWordDirection && !isValidWordDirection(newPath)) {
        // Se a direção não é válida, retornar apenas a nova posição (recomeçar seleção)
        return [prev[0], newPosition];
      }
      
      logger.debug('Adicionando célula à seleção', { 
        newPosition,
        pathLength: newPath.length 
      }, 'BOARD_INTERACTION');
      
      return newPath;
    });
  }, [isSelecting]);

  const handleCellEnd = useCallback(() => {
    logger.debug('Finalizando seleção', { 
      selectedCellsCount: selectedCells.length 
    }, 'BOARD_INTERACTION');
    setIsSelecting(false);
    const finalSelection = [...selectedCells];
    setSelectedCells([]);
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
