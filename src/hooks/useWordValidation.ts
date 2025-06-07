
import { type Position } from '@/utils/boardUtils';

export const useWordValidation = () => {
  // Função para validar se as células formam uma linha válida (horizontal, vertical ou diagonal)
  const isValidWordDirection = (positions: Position[]): boolean => {
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
  };

  return {
    isValidWordDirection
  };
};
