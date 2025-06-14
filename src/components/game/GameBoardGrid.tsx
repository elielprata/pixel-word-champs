
import React, { useRef } from 'react';
import GameCell from './GameCell';
import { getCellSize, getBoardWidth, getMobileBoardWidth, type Position } from '@/utils/boardUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { logger } from '@/utils/logger';

interface GameBoardGridProps {
  boardData: { board: string[][] };
  size: number; // altura (12)
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
  size, // altura (12)
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
  const boardWidth = isMobile ? getMobileBoardWidth(1) : getBoardWidth(1); // largura (8)

  logger.debug('Renderizando GameBoardGrid 12x8', { 
    height: size, 
    width: boardWidth,
    selectedCellsCount: selectedCells.length, 
    isSelecting,
    isMobile,
    cellSize
  }, 'GAME_BOARD_GRID');

  // Configurações específicas para tabuleiro 12x8
  const gridConfig = {
    gap: isMobile ? '1px' : '2px',
    maxWidth: isMobile ? '340px' : '400px',
    padding: isMobile ? '4px' : '6px'
  };

  // Função simplificada para finalizar seleção
  const handleEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    logger.debug('Finalizando seleção no grid 12x8', { 
      isMobile,
      selectedCellsCount: selectedCells.length 
    }, 'GAME_BOARD_GRID');
    handleCellEndWithValidation();
  };

  return (
    <div 
      ref={boardRef}
      className="grid mx-auto"
      style={{ 
        gridTemplateColumns: `repeat(${boardWidth}, 1fr)`, // 8 colunas
        gridTemplateRows: `repeat(${size}, 1fr)`, // 12 linhas
        gap: gridConfig.gap,
        maxWidth: gridConfig.maxWidth,
        width: '100%',
        touchAction: 'none',
        padding: gridConfig.padding
      }}
      onTouchEnd={handleEnd}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
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
            onCellMove={handleCellMove}
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
