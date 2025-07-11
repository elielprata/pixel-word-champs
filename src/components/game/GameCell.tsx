
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
  // FASE 3: Proteção rigorosa contra gestos na célula
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // FASE 1: Verificar se é gesto multi-touch
    if (e.touches && e.touches.length > 1) {
      return false;
    }
    onCellStart(rowIndex, colIndex);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    // FASE 1: Bloquear gestos multi-touch
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
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
    onCellStart(rowIndex, colIndex);
  };

  const handleMouseEnter = () => {
    if (isDragging) {
      onCellMove(rowIndex, colIndex);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    onCellEnd();
  };

  // FASE 4: Bloquear context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // FASE 6: Hierarquia visual preservada com animações sem zoom
  const getCellClasses = () => {
    const baseClasses = "flex items-center justify-center font-bold relative transition-all duration-300 select-none cursor-pointer webkit-optimized";
    
    if (isHintHighlighted) {
      return `${baseClasses} bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/50 animate-pulse`;
    }
    
    if (isPermanentlyMarked && wordColor) {
      // FASE 6: Substituir hover:scale por filter
      return `${baseClasses} ${wordColor} text-white shadow-lg animate-bounce-in brightness-110`;
    }
    
    if (isSelected) {
      return `${baseClasses} bg-gradient-to-br from-yellow-300 to-yellow-400 text-gray-800 shadow-lg shadow-yellow-500/50 animate-pulse`;
    }
    
    // FASE 6: Estado normal com efeitos visuais sem zoom
    return `${baseClasses} bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 hover:brightness-110 hover:contrast-105 shadow-md`;
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
        // FASE 3: Proteção total na célula
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        touchAction: "none",
        // FASE 2: Overscroll bloqueado
        overscrollBehavior: "none",
        padding: 0,
        margin: 0,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
      data-cell="true"
      data-row={rowIndex}
      data-col={colIndex}
    >
      {/* Letra principal */}
      <span className="relative z-10 font-bold tracking-tight">
        {letter}
      </span>
      
      {/* FASE 6: Efeitos visuais preservados */}
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
