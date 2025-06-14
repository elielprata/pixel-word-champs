

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

  // Layout limpo
  const gridConfig = {
    gap: "1px",
    maxWidth: isMobile ? "340px" : "400px",
    padding: "0px",
  };

  // Função que indica se a célula está atualmente selecionada na linha visual
  const isCellCurrentlySelected = (row: number, col: number) =>
    selectedCells.some((pos) => pos.row === row && pos.col === col);

  // Função para obter a cor da palavra se a célula estiver marcada permanentemente
  const getCellWordColor = (row: number, col: number) => {
    if (!isCellPermanentlyMarked(row, col)) return undefined;
    const wordIndex = getCellWordIndex(row, col);
    return wordIndex >= 0 ? getWordColor(wordIndex) : undefined;
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
        handleCellEnd();
      }}
      onMouseUp={(e) => {
        e.preventDefault();
        handleCellEnd();
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

