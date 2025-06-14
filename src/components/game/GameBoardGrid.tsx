
import React, { useRef } from "react";
import GameCell from "./GameCell";
import { getCellSize, getBoardWidth, getMobileBoardWidth, type Position } from "@/utils/boardUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface GameBoardGridProps {
  boardData: { board: string[][] };
  size: number;
  startCell: Position | null;
  currentCell: Position | null;
  isDragging: boolean;
  isCellSelected: (row: number, col: number) => boolean;
  handleStart: (row: number, col: number) => void;
  handleDrag: (row: number, col: number) => void;
  handleEnd: () => void;
}

const GameBoardGrid = ({
  boardData,
  size,
  startCell,
  currentCell,
  isDragging,
  isCellSelected,
  handleStart,
  handleDrag,
  handleEnd,
}: GameBoardGridProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const cellSize = getCellSize(size, isMobile);
  const boardWidth = isMobile ? getMobileBoardWidth(1) : getBoardWidth(1);

  // Layout limpo
  const gridConfig = {
    gap: "1px",
    maxWidth: isMobile ? "340px" : "400px",
    padding: "0px",
  };

  return (
    <div
      ref={boardRef}
      className="grid mx-auto bg-white"
      style={{
        gridTemplateColumns: `repeat(${boardWidth}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`,
        gap: gridConfig.gap,
        maxWidth: gridConfig.maxWidth,
        width: "100%",
        touchAction: "none",
        padding: gridConfig.padding,
        background: "white",
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleEnd();
      }}
      onMouseUp={(e) => {
        e.preventDefault();
        handleEnd();
      }}
    >
      {boardData.board.map((row, rowIndex) =>
        row.map((letter, colIndex) => (
          <GameCell
            key={`${rowIndex}-${colIndex}`}
            letter={letter}
            rowIndex={rowIndex}
            colIndex={colIndex}
            isSelected={isCellSelected(rowIndex, colIndex)}
            cellSize={cellSize}
            onCellStart={handleStart}
            onCellMove={handleDrag}
            onCellEnd={handleEnd}
            isDragging={isDragging}
            isMobile={isMobile}
          />
        ))
      )}
    </div>
  );
};

export default GameBoardGrid;
