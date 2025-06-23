
import React from "react";

interface GameCellProps {
  letter: string;
  rowIndex: number;
  colIndex: number;
  isSelected: boolean;
  isHintHighlighted: boolean;
  isPermanentlyMarked: boolean;
  wordColor?: string;
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
  isPermanentlyMarked,
  wordColor,
  cellSize,
  onCellStart,
  onCellMove,
  onCellEnd,
  isDragging,
  isMobile = false,
}: GameCellProps) => {
  const getCellClasses = () => {
    const baseClasses = "flex items-center justify-center font-bold relative transition-all duration-300 select-none cursor-pointer transform hover:scale-105 active:scale-95";
    
    if (isHintHighlighted) {
      return `${baseClasses} bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/50 animate-pulse`;
    }
    
    if (isPermanentlyMarked && wordColor) {
      return `${baseClasses} bg-gradient-to-br ${wordColor} text-white shadow-lg animate-bounce-in`;
    }
    
    if (isSelected) {
      return `${baseClasses} bg-gradient-to-br from-yellow-300 to-yellow-400 text-gray-800 shadow-lg shadow-yellow-500/50 animate-pulse`;
    }
    
    return `${baseClasses} bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 hover:from-gray-100 hover:to-gray-200 shadow-md`;
  };

  const fontSize = isMobile
    ? Math.max(cellSize * 0.65, 17)
    : Math.max(cellSize * 0.75, 19);

  const borderRadius = isMobile ? "8px" : "10px";
  const showParticleEffect = isPermanentlyMarked && wordColor;

  return (
    <div
      className={getCellClasses()}
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
      <span className="relative z-10 font-bold tracking-tight">
        {letter}
      </span>
      
      {isHintHighlighted && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-300/50 to-transparent rounded-lg animate-pulse" />
      )}
      
      {showParticleEffect && (
        <>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent rounded-lg" />
        </>
      )}
      
      {isSelected && (
        <div className="absolute inset-0 rounded-lg shadow-lg shadow-yellow-400/30 animate-pulse" />
      )}
    </div>
  );
};

export default GameCell;
