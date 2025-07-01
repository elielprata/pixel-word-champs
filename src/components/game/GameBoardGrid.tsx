
import React, { useRef } from "react";
import GameCell from "./GameCell";
import { getCellSize, getBoardWidth, getMobileBoardWidth, type Position } from "@/utils/boardUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface GameBoardGridProps {
  boardData: { board: string[][] };
  size: number;
  selectedCells: Position[];
  isDragging: boolean;
  isCellSelected: (row: number, col: number) => boolean;
  isCellPermanentlyMarked: (row: number, col: number) => boolean;
  isCellHintHighlighted: (row: number, col: number) => boolean;
  handleCellStart: (row: number, col: number) => void;
  handleCellMove: (row: number, col: number) => void;
  handleCellEnd: () => void;
  getWordColor: (wordIndex: number) => string;
  getCellWordIndex: (row: number, col: number) => number;
}

const GameBoardGrid = ({
  boardData,
  size,
  selectedCells,
  isDragging,
  isCellSelected,
  isCellPermanentlyMarked,
  isCellHintHighlighted,
  handleCellStart,
  handleCellMove,
  handleCellEnd,
  getWordColor,
  getCellWordIndex
}: GameBoardGridProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const cellSize = getCellSize(size, isMobile);
  const boardWidth = isMobile ? getMobileBoardWidth(1) : getBoardWidth(1);

  const gridConfig = {
    gap: "1px",
    maxWidth: isMobile ? "360px" : "480px",
    padding: "0px",
  };

  const isCellCurrentlySelected = (row: number, col: number) =>
    selectedCells.some((pos) => pos.row === row && pos.col === col);

  const getCellWordColor = (row: number, col: number) => {
    if (!isCellPermanentlyMarked(row, col)) return undefined;
    const wordIndex = getCellWordIndex(row, col);
    return wordIndex >= 0 ? getWordColor(wordIndex) : undefined;
  };

  // FASE 3: Event handlers com proteção rigorosa contra gestos
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Verificar se é gesto multi-touch (zoom)
    if (e.touches && e.touches.length > 1) {
      return false;
    }
    handleCellEnd();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleCellEnd();
  };

  // FASE 2: Bloqueio específico de scroll no grid
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <div
      ref={boardRef}
      className="grid mx-auto bg-white game-area-protection webkit-optimized"
      data-game-area="true"
      style={{
        gridTemplateColumns: `repeat(${boardWidth}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`,
        gap: gridConfig.gap,
        maxWidth: gridConfig.maxWidth,
        width: "100%",
        // FASE 3: Touch action mais rigoroso
        touchAction: "none",
        // FASE 2: Overscroll bloqueado
        overscrollBehavior: "none",
        overscrollBehaviorX: "none",
        overscrollBehaviorY: "none",
        padding: gridConfig.padding,
        background: "white",
        // FASE 5: WebKit otimizações
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
      onTouchEnd={handleTouchEnd}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      // FASE 4: Proteção adicional contra gestos
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onGestureStart={(e: any) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onGestureChange={(e: any) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
    >
      {boardData.board.map((row, rowIndex) =>
        row.map((letter, colIndex) => (
          <GameCell
            key={`${rowIndex}-${colIndex}`}
            letter={letter}
            rowIndex={rowIndex}
            colIndex={colIndex}
            isSelected={isCellCurrentlySelected(rowIndex, colIndex)}
            isHintHighlighted={isCellHintHighlighted(rowIndex, colIndex)}
            isPermanentlyMarked={isCellPermanentlyMarked(rowIndex, colIndex)}
            wordColor={getCellWordColor(rowIndex, colIndex)}
            cellSize={cellSize}
            onCellStart={handleCellStart}
            onCellMove={handleCellMove}
            onCellEnd={handleCellEnd}
            isDragging={isDragging}
            isMobile={isMobile}
          />
        ))
      )}
    </div>
  );
};

export default GameBoardGrid;
