
import { type Position } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

export const useWordValidation = () => {
  // Função avançada para validar direções - linha de visão em vez de célula-por-célula
  const isValidWordDirection = (positions: Position[]): boolean => {
    if (positions.length < 2) return true;

    logger.debug('🔍 Validando direção com linha de visão', { 
      positionsCount: positions.length,
      positions 
    }, 'WORD_VALIDATION');

    const first = positions[0];
    const last = positions[positions.length - 1];
    
    const deltaRow = last.row - first.row;
    const deltaCol = last.col - first.col;
    
    // Verificar se é uma linha reta (horizontal, vertical ou diagonal)
    const isHorizontal = deltaRow === 0 && deltaCol !== 0;
    const isVertical = deltaCol === 0 && deltaRow !== 0;
    const isDiagonal = Math.abs(deltaRow) === Math.abs(deltaCol) && deltaRow !== 0 && deltaCol !== 0;
    
    if (!isHorizontal && !isVertical && !isDiagonal) {
      logger.debug('❌ Não é uma linha reta', { 
        deltaRow, 
        deltaCol,
        isHorizontal,
        isVertical,
        isDiagonal
      }, 'WORD_VALIDATION');
      return false;
    }
    
    // Para linhas retas, verificar se todos os pontos estão na mesma linha
    const direction = isHorizontal ? 'horizontal' : isVertical ? 'vertical' : 'diagonal';
    
    // Verificar se todos os pontos intermediários estão na linha reta
    for (let i = 1; i < positions.length - 1; i++) {
      const curr = positions[i];
      
      if (isHorizontal && curr.row !== first.row) {
        logger.debug('❌ Ponto fora da linha horizontal', { 
          expectedRow: first.row,
          actualRow: curr.row,
          position: i
        }, 'WORD_VALIDATION');
        return false;
      }
      
      if (isVertical && curr.col !== first.col) {
        logger.debug('❌ Ponto fora da linha vertical', { 
          expectedCol: first.col,
          actualCol: curr.col,
          position: i
        }, 'WORD_VALIDATION');
        return false;
      }
      
      if (isDiagonal) {
        const expectedRow = first.row + (Math.sign(deltaRow) * (curr.col - first.col));
        if (curr.row !== expectedRow) {
          logger.debug('❌ Ponto fora da linha diagonal', { 
            expectedRow,
            actualRow: curr.row,
            position: i
          }, 'WORD_VALIDATION');
          return false;
        }
      }
    }
    
    logger.debug('✅ Direção válida confirmada', { 
      direction,
      positionsCount: positions.length,
      lineOfSight: { deltaRow, deltaCol }
    }, 'WORD_VALIDATION');
    
    return true;
  };

  // Função para preencher células intermediárias automaticamente
  const fillIntermediateCells = (start: Position, end: Position): Position[] => {
    const cells: Position[] = [start];
    
    const deltaRow = end.row - start.row;
    const deltaCol = end.col - start.col;
    
    const stepRow = deltaRow === 0 ? 0 : Math.sign(deltaRow);
    const stepCol = deltaCol === 0 ? 0 : Math.sign(deltaCol);
    
    const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
    
    for (let i = 1; i < steps; i++) {
      cells.push({
        row: start.row + (stepRow * i),
        col: start.col + (stepCol * i)
      });
    }
    
    cells.push(end);
    
    logger.debug('🔗 Células intermediárias preenchidas', {
      start,
      end,
      steps,
      totalCells: cells.length,
      direction: { stepRow, stepCol }
    }, 'WORD_VALIDATION');
    
    return cells;
  };

  // Função melhorada para verificar linha de visão
  const isInLineWithSelection = (newPosition: Position, selectedPositions: Position[]): boolean => {
    if (selectedPositions.length === 0) return true;
    if (selectedPositions.length === 1) return true; // Qualquer posição é válida para a segunda

    const first = selectedPositions[0];
    const deltaRow = newPosition.row - first.row;
    const deltaCol = newPosition.col - first.col;
    
    // Verificar se é linha reta do primeiro ponto
    const isHorizontal = deltaRow === 0 && deltaCol !== 0;
    const isVertical = deltaCol === 0 && deltaRow !== 0;
    const isDiagonal = Math.abs(deltaRow) === Math.abs(deltaCol) && deltaRow !== 0 && deltaCol !== 0;
    
    const isValidLine = isHorizontal || isVertical || isDiagonal;
    
    if (!isValidLine) {
      logger.debug('❌ Nova posição não está em linha reta', {
        newPosition,
        first,
        deltaRow,
        deltaCol,
        isHorizontal,
        isVertical,
        isDiagonal
      }, 'WORD_VALIDATION');
      return false;
    }
    
    // Verificar se segue a mesma direção estabelecida
    const second = selectedPositions[1];
    const establishedDeltaRow = second.row - first.row;
    const establishedDeltaCol = second.col - first.col;
    
    const establishedStepRow = establishedDeltaRow === 0 ? 0 : Math.sign(establishedDeltaRow);
    const establishedStepCol = establishedDeltaCol === 0 ? 0 : Math.sign(establishedDeltaCol);
    
    const newStepRow = deltaRow === 0 ? 0 : Math.sign(deltaRow);
    const newStepCol = deltaCol === 0 ? 0 : Math.sign(deltaCol);
    
    const isSameDirection = newStepRow === establishedStepRow && newStepCol === establishedStepCol;
    
    logger.debug('🎯 Verificando linha de visão', {
      newPosition,
      first,
      establishedDirection: { row: establishedStepRow, col: establishedStepCol },
      newDirection: { row: newStepRow, col: newStepCol },
      isSameDirection
    }, 'WORD_VALIDATION');
    
    return isSameDirection;
  };

  return {
    isValidWordDirection,
    isInLineWithSelection,
    fillIntermediateCells
  };
};
