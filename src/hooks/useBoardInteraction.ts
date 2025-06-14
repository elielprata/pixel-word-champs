
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

  const handleCellMove = useCallback((row: number, col: number, isValidWordDirection: (positions: Position[]) => boolean) => {
    if (!isSelecting) {
      logger.debug('Movimento ignorado - não está selecionando', { row, col }, 'BOARD_INTERACTION');
      return;
    }
    
    const newPosition = { row, col };
    
    setSelectedCells(prev => {
      if (prev.length === 0) {
        logger.debug('Lista vazia, adicionando primeira posição', { row, col }, 'BOARD_INTERACTION');
        return [newPosition];
      }
      
      // Verificar se a nova posição já está selecionada
      const isAlreadySelected = prev.some(p => p.row === row && p.col === col);
      if (isAlreadySelected) {
        logger.debug('Posição já selecionada, ignorando', { row, col }, 'BOARD_INTERACTION');
        return prev;
      }
      
      // Se é a primeira posição após o início, adicionar diretamente
      if (prev.length === 1) {
        const newPath = [prev[0], newPosition];
        logger.debug('Segunda posição, validando direção', { 
          from: prev[0], 
          to: newPosition,
          isValid: isValidWordDirection(newPath) 
        }, 'BOARD_INTERACTION');
        
        if (isValidWordDirection(newPath)) {
          return newPath;
        } else {
          logger.debug('Direção inválida, mantendo seleção anterior', { newPath }, 'BOARD_INTERACTION');
          return prev;
        }
      }
      
      const newPath = [...prev, newPosition];
      
      // Validar se o caminho forma uma direção válida
      if (!isValidWordDirection(newPath)) {
        logger.debug('Caminho inválido, mantendo seleção anterior', { 
          currentPath: prev,
          attemptedPath: newPath 
        }, 'BOARD_INTERACTION');
        return prev;
      }
      
      logger.debug('Adicionando nova posição ao caminho', { 
        newPath,
        pathLength: newPath.length 
      }, 'BOARD_INTERACTION');
      
      return newPath;
    });
  }, [isSelecting]);

  const handleCellEnd = useCallback(() => {
    logger.debug('Finalizando seleção', { 
      selectedCellsCount: selectedCells.length,
      isSelecting 
    }, 'BOARD_INTERACTION');
    
    setIsSelecting(false);
    const finalSelection = [...selectedCells];
    setSelectedCells([]);
    
    return finalSelection;
  }, [selectedCells, isSelecting]);

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
