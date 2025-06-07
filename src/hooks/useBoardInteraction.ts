
import { useState } from 'react';
import { type Position } from '@/utils/boardUtils';

export const useBoardInteraction = () => {
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleCellStart = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const handleCellMove = (row: number, col: number, isValidWordDirection: (positions: Position[]) => boolean) => {
    if (!isSelecting) return;
    
    const newPosition = { row, col };
    setSelectedCells(prev => {
      if (prev.length === 0) return [newPosition];
      
      // Verificar se a nova posição já está selecionada
      if (prev.some(p => p.row === row && p.col === col)) {
        return prev;
      }
      
      const newPath = [...prev, newPosition];
      
      // Validar se o caminho forma uma direção válida
      if (!isValidWordDirection(newPath)) {
        return prev;
      }
      
      return newPath;
    });
  };

  const handleCellEnd = () => {
    setIsSelecting(false);
    const finalSelection = [...selectedCells];
    setSelectedCells([]);
    return finalSelection;
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(pos => pos.row === row && pos.col === col);
  };

  return {
    selectedCells,
    isSelecting,
    handleCellStart,
    handleCellMove,
    handleCellEnd,
    isCellSelected
  };
};
