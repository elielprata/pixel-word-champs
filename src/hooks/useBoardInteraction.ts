import { useState, useCallback } from 'react';
import { type Position } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

export const useBoardInteraction = () => {
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [previewCells, setPreviewCells] = useState<Position[]>([]);

  const handleCellStart = useCallback((row: number, col: number) => {
    logger.info('🎯 Iniciando seleção', { row, col }, 'BOARD_INTERACTION');
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
    setPreviewCells([{ row, col }]);
  }, []);

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

      // MAIS SIMPLES: só preenche caminho, não trava se não for linha exata
      const first = prev[0];
      const filledPath = fillIntermediateCells(first, newPosition);

      setPreviewCells(filledPath);
      logger.debug('✨ Seleção em andamento (relaxada)', {
        newPosition,
        pathLength: filledPath.length,
        selection: filledPath
      }, 'BOARD_INTERACTION');
      return filledPath;
    });
  }, [isSelecting]);

  const handleCellEnd = useCallback(() => {
    logger.info('🏁 Finalizando seleção', { 
      selectedCellsCount: selectedCells.length,
      hasSelection: selectedCells.length > 0
    }, 'BOARD_INTERACTION');
    setIsSelecting(false);
    const finalSelection = [...selectedCells];
    setSelectedCells([]);
    setPreviewCells([]);
    if (finalSelection.length > 0) {
      logger.info('📝 Seleção finalizada', {
        length: finalSelection.length,
        start: finalSelection[0],
        end: finalSelection[finalSelection.length - 1],
        positions: finalSelection
      }, 'BOARD_INTERACTION');
    }
    return finalSelection;
  }, [selectedCells]);

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
    handleCellStart,
    handleCellMove,
    handleCellEnd,
    isCellSelected,
    isCellPreviewed
  };
};
