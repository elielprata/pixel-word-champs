
import React, { useRef, useEffect } from "react";
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

  // Calcular largura máxima segura para evitar overflow - CORRIGIDO
  const safeMaxWidth = Math.min(
    isMobile ? 360 : 480,
    window.innerWidth - 32 // 16px padding de cada lado
  );

  // Layout otimizado para 8x12 sem overflow - REFORÇADO
  const gridConfig = {
    gap: "1px",
    maxWidth: `${safeMaxWidth}px`,
    padding: "0px",
  };

  // Verificar e corrigir overflow horizontal - REMOVIDO O BUG scale(0.95)
  useEffect(() => {
    if (boardRef.current) {
      const boardElement = boardRef.current;
      const boardActualWidth = boardElement.offsetWidth;
      const parentWidth = boardElement.parentElement?.offsetWidth || window.innerWidth;
      
      // Log para debug
      console.log('🎮 Tabuleiro dimensões:', {
        actualWidth: boardActualWidth,
        parentWidth,
        safeMaxWidth,
        cellSize,
        gap: gridConfig.gap,
        hasOverflow: boardActualWidth > parentWidth - 20
      });
      
      // Detectar overflow e aplicar correção SEM SCALE (CORRIGIDO)
      if (boardActualWidth > parentWidth - 20) {
        console.warn('⚠️ Overflow detectado no tabuleiro, aplicando correção sem zoom');
        boardElement.style.maxWidth = `${parentWidth - 20}px`;
        // REMOVIDO: boardElement.style.transform = 'scale(0.95)';
        // REMOVIDO: boardElement.style.transformOrigin = 'center';
        // Aplicar apenas ajuste de largura máxima sem transforms
        boardElement.style.width = '100%';
        boardElement.style.minWidth = '300px';
      }
    }
  }, [safeMaxWidth, cellSize]);

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
      className="grid mx-auto bg-white game-board-area no-zoom"
      style={{
        gridTemplateColumns: `repeat(${boardWidth}, 1fr)`, // 12 colunas
        gridTemplateRows: `repeat(${size}, 1fr)`, // 8 linhas
        gap: gridConfig.gap,
        maxWidth: gridConfig.maxWidth,
        width: "100%",
        minWidth: "300px", // Largura mínima para funcionalidade
        touchAction: "none",
        padding: gridConfig.padding,
        background: "white",
        // Proteção rigorosa contra overflow - REFORÇADA
        overflow: "hidden",
        boxSizing: "border-box",
        overflowX: "hidden",
        overflowY: "hidden",
        // Proteção adicional SEM TRANSFORMS
        willChange: "auto",
        transform: "none", // GARANTIR que não há transform
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
