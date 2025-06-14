
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

  const isValidDirection = useCallback((positions: Position[]): boolean => {
    if (positions.length < 2) return true;

    const first = positions[0];
    const second = positions[1];
    
    const deltaRow = second.row - first.row;
    const deltaCol = second.col - first.col;
    
    // Verificar se é horizontal, vertical ou diagonal
    const isHorizontal = deltaRow === 0 && Math.abs(deltaCol) === 1;
    const isVertical = deltaCol === 0 && Math.abs(deltaRow) === 1;
    const isDiagonal = Math.abs(deltaRow) === 1 && Math.abs(deltaCol) === 1;
    
    if (!isHorizontal && !isVertical && !isDiagonal) {
      return false;
    }
    
    // Verificar se todas as posições seguem a mesma direção
    for (let i = 2; i < positions.length; i++) {
      const curr = positions[i];
      const prev = positions[i - 1];
      
      const currDeltaRow = curr.row - prev.row;
      const currDeltaCol = curr.col - prev.col;
      
      if (currDeltaRow !== deltaRow || currDeltaCol !== deltaCol) {
        return false;
      }
    }
    
    return true;
  }, []);

  const isValidNextCell = useCallback((newPosition: Position, currentPath: Position[]): boolean => {
    if (currentPath.length === 0) return true;
    
    // Verificar se já está selecionada
    const isAlreadySelected = currentPath.some(p => p.row === newPosition.row && p.col === newPosition.col);
    if (isAlreadySelected) return false;

    // Para o primeiro movimento, aceitar qualquer direção válida
    if (currentPath.length === 1) {
      const first = currentPath[0];
      const deltaRow = Math.abs(newPosition.row - first.row);
      const deltaCol = Math.abs(newPosition.col - first.col);
      
      // Verificar se é adjacente e em direção válida
      return (deltaRow <= 1 && deltaCol <= 1 && (deltaRow + deltaCol) > 0);
    }

    // Para movimentos subsequentes, verificar se continua na mesma direção
    const testPath = [...currentPath, newPosition];
    return isValidDirection(testPath);
  }, [isValidDirection]);

  const handleCellMove = useCallback((row: number, col: number) => {
    if (!isSelecting) return;
    
    const newPosition = { row, col };
    
    setSelectedCells(prev => {
      if (prev.length === 0) return [newPosition];
      
      // Verificar se é um movimento válido
      if (!isValidNextCell(newPosition, prev)) {
        logger.debug('Movimento inválido rejeitado', { 
          newPosition,
          currentPath: prev
        }, 'BOARD_INTERACTION');
        return prev;
      }
      
      const newPath = [...prev, newPosition];
      
      logger.debug('Célula adicionada à seleção', { 
        newPosition,
        pathLength: newPath.length
      }, 'BOARD_INTERACTION');
      
      return newPath;
    });
  }, [isSelecting, isValidNextCell]);

  const handleCellEnd = useCallback(() => {
    logger.debug('Finalizando seleção', { 
      selectedCellsCount: selectedCells.length,
      finalPath: selectedCells
    }, 'BOARD_INTERACTION');
    setIsSelecting(false);
    
    // Não limpar a seleção imediatamente - deixar para o componente pai decidir
    const finalSelection = [...selectedCells];
    return finalSelection;
  }, [selectedCells]);

  const clearSelection = useCallback(() => {
    logger.debug('Limpando seleção manualmente', {}, 'BOARD_INTERACTION');
    setSelectedCells([]);
  }, []);

  const isCellSelected = useCallback((row: number, col: number) => {
    return selectedCells.some(pos => pos.row === row && pos.col === col);
  }, [selectedCells]);

  return {
    selectedCells,
    isSelecting,
    handleCellStart,
    handleCellMove,
    handleCellEnd,
    clearSelection,
    isCellSelected
  };
};
