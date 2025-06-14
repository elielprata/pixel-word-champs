
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
      
      // NOVA LÓGICA: Não aplicar validação durante o movimento
      // Permitir seleção livre durante o arrastar
      logger.debug('Adicionando célula à seleção (sem validação)', { 
        newPosition,
        pathLength: newPath.length,
        currentPath: newPath
      }, 'BOARD_INTERACTION');
      
      return newPath;
    });
  }, [isSelecting]);

  const handleCellEnd = useCallback((isValidWordDirection?: (positions: Position[]) => boolean) => {
    logger.debug('Finalizando seleção', { 
      selectedCellsCount: selectedCells.length,
      finalPath: selectedCells
    }, 'BOARD_INTERACTION');
    setIsSelecting(false);
    
    // NOVA LÓGICA: Aplicar validação apenas no final
    if (isValidWordDirection && selectedCells.length >= 2) {
      const isValidDirection = isValidWordDirection(selectedCells);
      logger.debug('Validação final de direção', {
        isValid: isValidDirection,
        pathLength: selectedCells.length
      }, 'BOARD_INTERACTION');
      
      if (!isValidDirection) {
        logger.warn('Seleção rejeitada por direção inválida', { 
          path: selectedCells 
        }, 'BOARD_INTERACTION');
        setSelectedCells([]);
        return [];
      }
    }
    
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
