
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

  // Layout limpo - ajustado para 8x12
  const gridConfig = {
    gap: "1px",
    maxWidth: isMobile ? "360px" : "480px",
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

  // ✅ EDGE DETECTION INTELIGENTE - Apenas extremidades perigosas (30px)
  const isEdgeTouchDangerous = (clientX: number, clientY: number) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const edgeThreshold = 30; // 30px das bordas extremas
    
    const isLeftEdge = clientX < edgeThreshold;
    const isRightEdge = clientX > screenWidth - edgeThreshold;
    const isTopEdge = clientY < edgeThreshold;
    const isBottomEdge = clientY > screenHeight - edgeThreshold;
    
    // Bloquear apenas gestos que podem causar navegação
    return isLeftEdge || isRightEdge || (isTopEdge && clientY < 20) || (isBottomEdge && clientY > screenHeight - 20);
  };

  // ✅ SMART TOUCH PREVENTION: Prevenir apenas gestures perigosos
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch && isEdgeTouchDangerous(touch.clientX, touch.clientY)) {
      console.log('🚫 Touch bloqueado na extremidade perigosa da tela');
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch && isEdgeTouchDangerous(touch.clientX, touch.clientY)) {
      console.log('🚫 Touch move bloqueado na extremidade perigosa da tela');
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  return (
    <div
      ref={boardRef}
      className="grid mx-auto bg-white smart-board-protection"
      style={{
        gridTemplateColumns: `repeat(${boardWidth}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`,
        gap: gridConfig.gap,
        maxWidth: gridConfig.maxWidth,
        width: "100%",
        touchAction: "pan-y", // ✅ INTELIGENTE: Permitir scroll vertical
        padding: gridConfig.padding,
        background: "white",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        overflowX: "hidden", // ✅ Previne overflow horizontal apenas
        WebkitTextSizeAdjust: "none", // ✅ ANTI-ZOOM ROBUSTO
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
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
