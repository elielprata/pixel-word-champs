
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

  // Verifica se uma posição forma linha reta com o ponto inicial
  const isValidLinearDirection = useCallback((start: Position, target: Position): boolean => {
    if (!start || !target) return false;
    
    const deltaRow = target.row - start.row;
    const deltaCol = target.col - start.col;
    
    // Mesma posição é válida
    if (deltaRow === 0 && deltaCol === 0) return true;
    
    // Horizontal (deltaRow = 0)
    if (deltaRow === 0 && deltaCol !== 0) return true;
    
    // Vertical (deltaCol = 0)
    if (deltaCol === 0 && deltaRow !== 0) return true;
    
    // Diagonal (|deltaRow| = |deltaCol|)
    if (Math.abs(deltaRow) === Math.abs(deltaCol)) return true;
    
    return false;
  }, []);

  // Inicia a seleção
  const handleStart = useCallback((row: number, col: number) => {
    setStartCell({ row, col });
    setCurrentCell({ row, col });
    setIsDragging(true);
  }, []);

  // Atualiza célula de destino apenas se formar linha reta
  const handleDrag = useCallback((row: number, col: number) => {
    if (!isDragging || !startCell) return;
    
    const targetPosition = { row, col };
    
    // Só atualiza se formar linha reta com o ponto inicial
    if (isValidLinearDirection(startCell, targetPosition)) {
      setCurrentCell(targetPosition);
    }
  }, [isDragging, startCell, isValidLinearDirection]);

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

  // Calcula todas as posições entre start → end (linha reta: horizontal/vertical/diagonal)
  const getLinearPath = (start: Position, end: Position): Position[] => {
    if (!start || !end) return [];
    const deltaRow = end.row - start.row;
    const deltaCol = end.col - start.col;
    const stepRow = Math.sign(deltaRow);
    const stepCol = Math.sign(deltaCol);
    const length = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
    if (length === 0) return [start];
    const path: Position[] = [];
    for (let i = 0; i <= length; i++) {
      path.push({ row: start.row + stepRow * i, col: start.col + stepCol * i });
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
