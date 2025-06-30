
import { useState, useCallback } from "react";
import { type Position } from "@/utils/boardUtils";

export interface SelectionState {
  startCell: Position | null;
  currentCell: Position | null;
  isDragging: boolean;
}

export const useSimpleSelection = () => {
  const [startCell, setStartCell] = useState<Position | null>(null);
  const [currentCell, setCurrentCell] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Inicia a seleção
  const handleStart = useCallback((row: number, col: number) => {
    setStartCell({ row, col });
    setCurrentCell({ row, col });
    setIsDragging(true);
  }, []);

  // Atualiza célula de destino em tempo real - APENAS SE FOR LINHA RETA
  const handleDrag = useCallback((row: number, col: number) => {
    if (isDragging && startCell) {
      const newCell = { row, col };
      
      // Verificar se o movimento forma uma linha reta
      if (isValidLinearPath(startCell, newCell)) {
        setCurrentCell(newCell);
      }
      // Se não for linha reta, manter a célula atual sem atualizar
    }
  }, [isDragging, startCell]);

  // Finaliza e retorna path reto
  const handleEnd = useCallback(() => {
    setIsDragging(false);
    const selection = startCell && currentCell
      ? getLinearPath(startCell, currentCell)
      : [];
    setStartCell(null);
    setCurrentCell(null);
    return selection;
  }, [startCell, currentCell]);

  // Verificar se o caminho é uma linha reta válida
  const isValidLinearPath = (start: Position, end: Position): boolean => {
    const deltaRow = end.row - start.row;
    const deltaCol = end.col - start.col;
    
    // Mesma célula
    if (deltaRow === 0 && deltaCol === 0) return true;
    
    // Horizontal (mesma linha)
    if (deltaRow === 0 && deltaCol !== 0) return true;
    
    // Vertical (mesma coluna)
    if (deltaCol === 0 && deltaRow !== 0) return true;
    
    // Diagonal (delta absoluto igual)
    if (Math.abs(deltaRow) === Math.abs(deltaCol)) return true;
    
    return false;
  };

  // Calcula todas as posições entre start → end (linha reta: horizontal/vertical/diagonal)
  const getLinearPath = (start: Position, end: Position): Position[] => {
    if (!start || !end) return [];
    
    const deltaRow = end.row - start.row;
    const deltaCol = end.col - start.col;
    const stepRow = deltaRow === 0 ? 0 : Math.sign(deltaRow);
    const stepCol = deltaCol === 0 ? 0 : Math.sign(deltaCol);
    const length = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
    
    if (length === 0) return [start];
    
    const path: Position[] = [];
    for (let i = 0; i <= length; i++) {
      path.push({ 
        row: start.row + stepRow * i, 
        col: start.col + stepCol * i 
      });
    }
    return path;
  };

  // Visual feedback: retorna true se (row,col) está na linha de seleção
  const isCellSelected = useCallback(
    (row: number, col: number) => {
      if (!startCell || !currentCell || !isDragging) return false;
      const path = getLinearPath(startCell, currentCell);
      return path.some((pos) => pos.row === row && pos.col === col);
    },
    [startCell, currentCell, isDragging]
  );

  return {
    startCell,
    currentCell,
    isDragging,
    handleStart,
    handleDrag,
    handleEnd,
    isCellSelected,
    // para debug e possíveis usos futuros
    getLinearPath,
  };
};
