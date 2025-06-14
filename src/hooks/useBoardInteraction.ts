
import { useState, useCallback } from 'react';
import { type Position } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

interface SelectionMetrics {
  attempts: number;
  successes: number;
  horizontalAttempts: number;
  verticalAttempts: number;
  diagonalAttempts: number;
  lastDirection: string | null;
}

export const useBoardInteraction = () => {
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [previewCells, setPreviewCells] = useState<Position[]>([]);
  const [metrics, setMetrics] = useState<SelectionMetrics>({
    attempts: 0,
    successes: 0,
    horizontalAttempts: 0,
    verticalAttempts: 0,
    diagonalAttempts: 0,
    lastDirection: null
  });

  const updateMetrics = useCallback((direction: string, success: boolean = false) => {
    setMetrics(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
      successes: success ? prev.successes + 1 : prev.successes,
      horizontalAttempts: direction === 'horizontal' ? prev.horizontalAttempts + 1 : prev.horizontalAttempts,
      verticalAttempts: direction === 'vertical' ? prev.verticalAttempts + 1 : prev.verticalAttempts,
      diagonalAttempts: direction === 'diagonal' ? prev.diagonalAttempts + 1 : prev.diagonalAttempts,
      lastDirection: direction
    }));
  }, []);

  const handleCellStart = useCallback((row: number, col: number) => {
    logger.info('🎯 Iniciando seleção inteligente', { 
      row, 
      col,
      metrics: metrics.attempts
    }, 'BOARD_INTERACTION');
    
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
    setPreviewCells([{ row, col }]);
  }, [metrics.attempts]);

  const handleCellMove = useCallback((
    row: number, 
    col: number, 
    isInLineWithSelection: (newPosition: Position, selectedPositions: Position[]) => boolean,
    fillIntermediateCells: (start: Position, end: Position) => Position[]
  ) => {
    if (!isSelecting) return;
    
    const newPosition = { row, col };
    
    setSelectedCells(prev => {
      if (prev.length === 0) return [newPosition];
      
      // Para múltiplas células, usar preenchimento automático
      if (prev.length >= 1) {
        if (!isInLineWithSelection(newPosition, prev)) {
          logger.debug('❌ Posição fora da linha de visão', { 
            newPosition,
            currentSelection: prev.length,
            firstPos: prev[0],
            lastPos: prev[prev.length - 1]
          }, 'BOARD_INTERACTION');
          return prev;
        }
        
        // Preencher células intermediárias automaticamente
        const first = prev[0];
        const filledPath = fillIntermediateCells(first, newPosition);
        
        // Determinar direção para métricas
        const deltaRow = newPosition.row - first.row;
        const deltaCol = newPosition.col - first.col;
        let direction = 'horizontal';
        if (deltaCol === 0) direction = 'vertical';
        else if (Math.abs(deltaRow) === Math.abs(deltaCol)) direction = 'diagonal';
        
        updateMetrics(direction);
        
        logger.debug('✅ Caminho inteligente criado', { 
          newPosition,
          pathLength: filledPath.length,
          direction,
          filled: filledPath.length - prev.length
        }, 'BOARD_INTERACTION');
        
        setPreviewCells(filledPath);
        return filledPath;
      }
      
      const newPath = [...prev, newPosition];
      setPreviewCells(newPath);
      
      logger.debug('✅ Adicionando posição à seleção', { 
        newPosition,
        pathLength: newPath.length 
      }, 'BOARD_INTERACTION');
      
      return newPath;
    });
  }, [isSelecting, updateMetrics]);

  const handleCellEnd = useCallback(() => {
    logger.info('🏁 Finalizando seleção inteligente', { 
      selectedCellsCount: selectedCells.length,
      hasSelection: selectedCells.length > 0,
      metrics
    }, 'BOARD_INTERACTION');
    
    setIsSelecting(false);
    const finalSelection = [...selectedCells];
    setSelectedCells([]);
    setPreviewCells([]);
    
    // Marcar como sucesso se seleção válida
    if (finalSelection.length >= 3) {
      const first = finalSelection[0];
      const last = finalSelection[finalSelection.length - 1];
      const deltaRow = last.row - first.row;
      const deltaCol = last.col - first.col;
      
      let direction = 'horizontal';
      if (deltaCol === 0) direction = 'vertical';
      else if (Math.abs(deltaRow) === Math.abs(deltaCol)) direction = 'diagonal';
      
      updateMetrics(direction, true);
    }
    
    // Log da seleção final com métricas
    if (finalSelection.length > 0) {
      logger.info('📝 Seleção finalizada com métricas', {
        length: finalSelection.length,
        start: finalSelection[0],
        end: finalSelection[finalSelection.length - 1],
        positions: finalSelection,
        currentMetrics: metrics
      }, 'BOARD_INTERACTION');
    }
    
    return finalSelection;
  }, [selectedCells, metrics, updateMetrics]);

  const isCellSelected = useCallback((row: number, col: number) => {
    return selectedCells.some(pos => pos.row === row && pos.col === col);
  }, [selectedCells]);

  const isCellPreviewed = useCallback((row: number, col: number) => {
    return previewCells.some(pos => pos.row === row && pos.col === col) &&
           !selectedCells.some(pos => pos.row === row && pos.col === col);
  }, [previewCells, selectedCells]);

  return {
    selectedCells,
    previewCells,
    isSelecting,
    metrics,
    handleCellStart,
    handleCellMove,
    handleCellEnd,
    isCellSelected,
    isCellPreviewed
  };
};
