
import React, { useRef } from 'react';
import GameCell from './GameCell';
import { getCellSize, type Position } from '@/utils/boardUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { logger } from '@/utils/logger';

interface GameBoardGridProps {
  boardData: { board: string[][] };
  size: number;
  selectedCells: Position[];
  isSelecting: boolean;
  isCellSelected: (row: number, col: number) => boolean;
  isCellPermanentlyMarked: (row: number, col: number) => boolean;
  isCellHintHighlighted: (row: number, col: number) => boolean;
  handleCellStart: (row: number, col: number) => void;
  handleCellMove: (row: number, col: number) => void;
  handleCellEndWithValidation: () => void;
  getWordColor: (wordIndex: number) => string;
  getCellWordIndex: (row: number, col: number) => number;
}

const GameBoardGrid = ({
  boardData,
  size,
  selectedCells,
  isSelecting,
  isCellSelected,
  isCellPermanentlyMarked,
  isCellHintHighlighted,
  handleCellStart,
  handleCellMove,
  handleCellEndWithValidation,
  getWordColor,
  getCellWordIndex
}: GameBoardGridProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const cellSize = getCellSize(size, isMobile);

  logger.debug('Renderizando GameBoardGrid', { 
    size, 
    selectedCellsCount: selectedCells.length, 
    isSelecting,
    isMobile,
    cellSize
  }, 'GAME_BOARD_GRID');

  // Configurações específicas para mobile
  const gridConfig = {
    gap: isMobile ? (size > 10 ? '1px' : '2px') : (size > 8 ? '2px' : '3px'),
    maxWidth: isMobile ? 
      (size > 12 ? '320px' : size > 10 ? '350px' : '360px') : 
      (size > 8 ? '380px' : '360px'),
    padding: isMobile ? '4px' : '6px'
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isMobile) return;
    
    e.preventDefault();
    logger.debug('Desktop mouse up detectado no grid', { isSelecting }, 'GAME_BOARD_GRID');
    
    if (isSelecting) {
      handleCellEndWithValidation();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    e.preventDefault();
    logger.debug('Touch end detectado no grid', { isSelecting }, 'GAME_BOARD_GRID');
    
    if (isSelecting) {
      handleCellEndWithValidation();
    }
  };

  return (
    <div 
      ref={boardRef}
      className="grid mx-auto"
      style={{ 
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: gridConfig.gap,
        maxWidth: gridConfig.maxWidth,
        width: '100%',
        touchAction: 'none',
        padding: gridConfig.padding,
        overflowX: isMobile && size > 12 ? 'auto' : 'visible'
      }}
      onTouchEnd={handleTouchEnd}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Finalizar seleção se o mouse sair do grid
    >
      {boardData.board.map((row, rowIndex) =>
        row.map((letter, colIndex) => (
          <GameCell
            key={`${rowIndex}-${colIndex}`}
            letter={letter}
            rowIndex={rowIndex}
            colIndex={colIndex}
            isSelected={isCellSelected(rowIndex, colIndex)}
            isPermanent={isCellPermanentlyMarked(rowIndex, colIndex)}
            isHintHighlighted={isCellHintHighlighted(rowIndex, colIndex)}
            cellSize={cellSize}
            onCellStart={handleCellStart}
            onCellMove={(row, col) => handleCellMove(row, col)}
            isSelecting={isSelecting}
            isMobile={isMobile}
            wordColorClass={isCellPermanentlyMarked(rowIndex, colIndex) 
              ? getWordColor(getCellWordIndex(rowIndex, colIndex))
              : undefined
            }
          />
        ))
      )}
    </div>
  );
};

export default GameBoardGrid;
