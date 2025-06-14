import React from "react";

interface GameCellProps {
  letter: string;
  rowIndex: number;
  colIndex: number;
  isSelected: boolean;
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
  cellSize,
  onCellStart,
  onCellMove,
  onCellEnd,
  isDragging,
  isMobile = false,
}: GameCellProps) => {
  // Visual limpo: só fundo selecionado/neutro
  const cellClass = `flex items-center justify-center font-medium relative transition-all duration-100 select-none ${
    isSelected ? "bg-blue-100" : "bg-white"
  } border border-gray-200`;

  const fontSize = isMobile
    ? Math.max(cellSize * 0.6, 16)
    : Math.max(cellSize * 0.7, 18);

  const borderRadius = isMobile ? "5px" : "7px";

  // Eventos ultra-limpos
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
        boxShadow: "none",
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
