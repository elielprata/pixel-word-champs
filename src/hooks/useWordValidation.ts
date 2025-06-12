
import { type Position } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

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
      logger.debug('Direção inválida detectada', { 
        deltaRow, 
        deltaCol, 
        positionsCount: positions.length 
      }, 'WORD_VALIDATION');
      return false;
    }
    
    // Verificar se todas as posições seguem a mesma direção
    for (let i = 2; i < positions.length; i++) {
      const curr = positions[i];
      const prev = positions[i - 1];
      
      const currDeltaRow = curr.row - prev.row;
      const currDeltaCol = curr.col - prev.col;
      
      if (currDeltaRow !== deltaRow || currDeltaCol !== deltaCol) {
        logger.debug('Inconsistência na direção detectada', { 
          expectedDelta: { deltaRow, deltaCol },
          actualDelta: { currDeltaRow, currDeltaCol },
          position: i
        }, 'WORD_VALIDATION');
        return false;
      }
    }
    
    logger.debug('Direção válida confirmada', { 
      direction: isHorizontal ? 'horizontal' : isVertical ? 'vertical' : 'diagonal',
      positionsCount: positions.length
    }, 'WORD_VALIDATION');
    return true;
  };

  return {
    isValidWordDirection
  };
};
