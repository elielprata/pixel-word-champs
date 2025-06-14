
import React from "react";

interface GameCellProps {
  letter: string;
  rowIndex: number;
  colIndex: number;
  isSelected: boolean;
  isHintHighlighted: boolean;
  cellSize: number;
  onCellStart: (row: number, col: number) => void;
  onCellMove: (row: number, col: number) => void;
  onCellEnd: () => void;
  isDragging: boolean;
  isMobile?: boolean;
}

const GameCell = ({
  letter,
  rowIndex,
  colIndex,
  isSelected,
  isHintHighlighted,
  cellSize,
  onCellStart,
  onCellMove,
  onCellEnd,
  isDragging,
  isMobile = false,
}: GameCellProps) => {
  // Priorizar destaque da dica sobre seleção normal
  const getCellBackground = () => {
    if (isHintHighlighted) {
      return "bg-gradient-to-br from-yellow-200 to-amber-300 animate-pulse";
    }
    if (isSelected) {
      return "bg-blue-100";
    }
    return "bg-white";
  };

  const cellClass = `flex items-center justify-center font-medium relative transition-all duration-200 select-none ${getCellBackground()} border border-gray-200`;

  const fontSize = isMobile
    ? Math.max(cellSize * 0.6, 16)
    : Math.max(cellSize * 0.7, 18);

  const borderRadius = isMobile ? "5px" : "7px";

  return (
    <div
      className={cellClass}
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        fontSize: `${fontSize}px`,
        borderRadius,
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        padding: 0,
        margin: 0,
        boxShadow: isHintHighlighted ? "0 0 8px rgba(251, 191, 36, 0.6)" : "none",
      }}
      onMouseDown={() => onCellStart(rowIndex, colIndex)}
      onMouseEnter={() => isDragging && onCellMove(rowIndex, colIndex)}
      onMouseUp={() => onCellEnd()}
      onTouchStart={(e) => {
        e.preventDefault();
        onCellStart(rowIndex, colIndex);
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        if (!touch) return;
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!element) return;
        const cellAttr = element.closest("[data-cell]");
        if (cellAttr) {
          const row = parseInt(cellAttr.getAttribute("data-row") || "0");
          const col = parseInt(cellAttr.getAttribute("data-col") || "0");
          onCellMove(row, col);
        }
      }}
      onTouchEnd={() => onCellEnd()}
      data-cell="true"
      data-row={rowIndex}
      data-col={colIndex}
    >
      <span className="relative z-10 font-medium tracking-tight">
        {letter}
      </span>
    </div>
  );
};

export default GameCell;
