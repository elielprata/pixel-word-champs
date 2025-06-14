
import { type Position } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

export const useWordValidation = () => {
  // Função melhorada para validar direções - permite seleções em linha reta com qualquer espaçamento
  const isValidWordDirection = (positions: Position[]): boolean => {
    if (positions.length < 2) return true;

    logger.debug('🔍 Validando direção da palavra', { 
      positionsCount: positions.length,
      positions: positions.slice(0, 3)
    }, 'WORD_VALIDATION');

    const first = positions[0];
    const second = positions[1];
    
    const deltaRow = second.row - first.row;
    const deltaCol = second.col - first.col;
    
    // Permitir qualquer direção em linha reta
    const isHorizontal = deltaRow === 0 && deltaCol !== 0;
    const isVertical = deltaCol === 0 && deltaRow !== 0;
    const isDiagonal = Math.abs(deltaRow) === Math.abs(deltaCol) && deltaRow !== 0 && deltaCol !== 0;
    
    if (!isHorizontal && !isVertical && !isDiagonal) {
      logger.debug('❌ Direção inválida - não é linha reta', { 
        deltaRow, 
        deltaCol,
        isHorizontal,
        isVertical,
        isDiagonal
      }, 'WORD_VALIDATION');
      return false;
    }
    
    // Normalizar direção para +1, 0 ou -1
    const normalizedDeltaRow = deltaRow === 0 ? 0 : Math.sign(deltaRow);
    const normalizedDeltaCol = deltaCol === 0 ? 0 : Math.sign(deltaCol);
    
    // Verificar se todas as posições seguem a mesma direção normalizada
    for (let i = 1; i < positions.length - 1; i++) {
      const curr = positions[i + 1];
      const prev = positions[i];
      
      const currDeltaRow = curr.row - prev.row;
      const currDeltaCol = curr.col - prev.col;
      
      const currNormalizedDeltaRow = currDeltaRow === 0 ? 0 : Math.sign(currDeltaRow);
      const currNormalizedDeltaCol = currDeltaCol === 0 ? 0 : Math.sign(currDeltaCol);
      
      if (currNormalizedDeltaRow !== normalizedDeltaRow || currNormalizedDeltaCol !== normalizedDeltaCol) {
        logger.debug('❌ Inconsistência na direção', { 
          expectedNormalized: { row: normalizedDeltaRow, col: normalizedDeltaCol },
          actualNormalized: { row: currNormalizedDeltaRow, col: currNormalizedDeltaCol },
          position: i + 1
        }, 'WORD_VALIDATION');
        return false;
      }
    }
    
    const direction = isHorizontal ? 'horizontal' : isVertical ? 'vertical' : 'diagonal';
    logger.debug('✅ Direção válida confirmada', { 
      direction,
      positionsCount: positions.length,
      normalizedDirection: { row: normalizedDeltaRow, col: normalizedDeltaCol }
    }, 'WORD_VALIDATION');
    
    return true;
  };

  // Função auxiliar melhorada para verificar se uma posição está em linha reta
  const isInLineWithSelection = (newPosition: Position, selectedPositions: Position[]): boolean => {
    if (selectedPositions.length === 0) return true;
    if (selectedPositions.length === 1) return true; // Qualquer posição é válida para a segunda

    // Usar apenas os dois primeiros pontos para determinar a direção
    const first = selectedPositions[0];
    const second = selectedPositions[1];
    
    const deltaRow = second.row - first.row;
    const deltaCol = second.col - first.col;
    
    const normalizedDeltaRow = deltaRow === 0 ? 0 : Math.sign(deltaRow);
    const normalizedDeltaCol = deltaCol === 0 ? 0 : Math.sign(deltaCol);
    
    // Verificar se a nova posição segue a mesma direção em relação à última selecionada
    const lastPos = selectedPositions[selectedPositions.length - 1];
    const newDeltaRow = newPosition.row - lastPos.row;
    const newDeltaCol = newPosition.col - lastPos.col;
    
    const newNormalizedDeltaRow = newDeltaRow === 0 ? 0 : Math.sign(newDeltaRow);
    const newNormalizedDeltaCol = newDeltaCol === 0 ? 0 : Math.sign(newDeltaCol);
    
    const isValid = newNormalizedDeltaRow === normalizedDeltaRow && newNormalizedDeltaCol === normalizedDeltaCol;
    
    logger.debug('🎯 Verificando linha reta', {
      newPosition,
      lastPos,
      expectedDirection: { row: normalizedDeltaRow, col: normalizedDeltaCol },
      actualDirection: { row: newNormalizedDeltaRow, col: newNormalizedDeltaCol },
      isValid
    }, 'WORD_VALIDATION');
    
    return isValid;
  };

  return {
    isValidWordDirection,
    isInLineWithSelection
  };
};
