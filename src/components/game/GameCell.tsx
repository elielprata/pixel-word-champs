
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
  // ✅ PROTEÇÃO CONTRA EVENTOS DUPLICADOS E SCROLL
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCellStart(rowIndex, colIndex);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDragging) return;
    
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
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCellEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCellStart(rowIndex, colIndex);
  };

  const handleMouseEnter = () => {
    if (isDragging) {
      onCellMove(rowIndex, colIndex);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCellEnd();
  };

  // PREVENT SCROLL EVENTS - Handlers específicos por tipo de evento
  const preventWheelScroll = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const preventDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Hierarquia visual gamificada: Dica > Palavra encontrada > Seleção atual > Normal
  const getCellClasses = () => {
    const baseClasses = "flex items-center justify-center font-bold relative transition-all duration-300 select-none cursor-pointer transform hover:scale-105 active:scale-95 touch-none no-scroll no-overscroll";
    
    if (isHintHighlighted) {
      return `${baseClasses} bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/50 animate-pulse`;
    }
    
    if (isPermanentlyMarked && wordColor) {
      return `${baseClasses} ${wordColor} text-white shadow-lg animate-bounce-in`;
    }
    
    if (isSelected) {
      return `${baseClasses} bg-gradient-to-br from-yellow-300 to-yellow-400 text-gray-800 shadow-lg shadow-yellow-500/50 animate-pulse`;
    }
    
    // Estado normal com gradiente sutil
    return `${baseClasses} bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 hover:from-gray-100 hover:to-gray-200 shadow-md`;
  };

  const fontSize = isMobile
    ? Math.max(cellSize * 0.65, 17)
    : Math.max(cellSize * 0.75, 19);

  const borderRadius = isMobile ? "8px" : "10px";

  // Efeito de partículas para célula encontrada
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
        touchAction: "none",
        padding: 0,
        margin: 0,
        overflow: "hidden",
        overscrollBehavior: "none"
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={preventWheelScroll}
      onDragStart={preventDragStart}
      onContextMenu={preventContextMenu}
      data-cell="true"
      data-row={rowIndex}
      data-col={colIndex}
    >
      {/* Letra principal */}
      <span className="relative z-10 font-bold tracking-tight touch-none">
        {letter}
      </span>
      
      {/* Efeito de brilho para dica */}
      {isHintHighlighted && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-300/50 to-transparent rounded-lg animate-pulse touch-none" />
      )}
      
      {/* Efeito de celebração para palavra encontrada */}
      {showParticleEffect && (
        <>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping touch-none" />
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white rounded-full animate-bounce touch-none" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent rounded-lg touch-none" />
        </>
      )}
      
      {/* Borda brilhante para seleção */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg shadow-lg shadow-yellow-400/30 animate-pulse touch-none" />
      )}
    </div>
  );
};

export default GameCell;
