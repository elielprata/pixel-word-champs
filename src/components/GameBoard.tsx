import React, { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Clock, Lightbulb, RotateCcw } from 'lucide-react';

interface Position {
  row: number;
  col: number;
}

interface GameBoardProps {
  level: number;
  timeLeft: number;
  onWordFound: (word: string, points: number) => void;
  onTimeUp: () => void;
}

const GameBoard = ({ level, timeLeft, onWordFound, onTimeUp }: GameBoardProps) => {
  const getBoardSize = (level: number) => {
    if (level >= 1 && level <= 2) return 5;   // 5x5
    if (level >= 3 && level <= 4) return 6;   // 6x6
    if (level >= 5 && level <= 6) return 7;   // 7x7
    if (level >= 7 && level <= 8) return 8;   // 8x8
    if (level >= 9 && level <= 10) return 9;  // 9x9
    if (level >= 11 && level <= 20) return 10; // 10x10
    return 10; // default for levels beyond 20
  };

  const size = getBoardSize(level);
  const [board] = useState(() => {
    // Generate random letters for demo
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array(size).fill(null).map(() => 
      Array(size).fill(null).map(() => 
        letters[Math.floor(Math.random() * letters.length)]
      )
    );
  });

  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);

  const getPointsForWord = (word: string) => {
    const length = word.length;
    if (length === 3) return 1;
    if (length === 4) return 2;
    if (length === 5) return 3;
    return 5 + Math.max(0, length - 6);
  };

  const handleCellStart = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const handleCellMove = (row: number, col: number) => {
    if (!isSelecting) return;
    
    const newPosition = { row, col };
    setSelectedCells(prev => {
      // Check if this creates a valid line
      if (prev.length === 0) return [newPosition];
      
      const lastPos = prev[prev.length - 1];
      const isValid = Math.abs(row - lastPos.row) <= 1 && Math.abs(col - lastPos.col) <= 1;
      
      if (isValid && !prev.some(p => p.row === row && p.col === col)) {
        return [...prev, newPosition];
      }
      return prev;
    });
  };

  const handleCellEnd = () => {
    if (selectedCells.length >= 3) {
      const word = selectedCells.map(pos => board[pos.row][pos.col]).join('');
      if (!foundWords.includes(word) && word.length >= 3) {
        const points = getPointsForWord(word);
        setFoundWords(prev => [...prev, word]);
        onWordFound(word, points);
      }
    }
    setIsSelecting(false);
    setSelectedCells([]);
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(pos => pos.row === row && pos.col === col);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cellSize = Math.min(280 / size, 45);

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-md mb-4">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-md">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-gray-800">{formatTime(timeLeft)}</span>
        </div>
        <div className="text-lg font-bold text-purple-600">Nível {level}</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="rounded-full">
            <Lightbulb className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="rounded-full">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Game Board */}
      <div 
        ref={boardRef}
        className="grid gap-1 p-4 bg-white rounded-2xl shadow-lg mb-4"
        style={{ 
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          maxWidth: '320px'
        }}
        onTouchEnd={handleCellEnd}
        onMouseUp={handleCellEnd}
      >
        {board.map((row, rowIndex) =>
          row.map((letter, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                flex items-center justify-center font-bold text-lg cursor-pointer
                transition-all duration-200 rounded-lg border-2
                ${isCellSelected(rowIndex, colIndex) 
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white border-purple-300 shadow-lg scale-110' 
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-200 hover:border-purple-300'
                }
              `}
              style={{ 
                width: `${cellSize}px`, 
                height: `${cellSize}px`,
                fontSize: `${Math.max(cellSize * 0.4, 12)}px`
              }}
              onTouchStart={() => handleCellStart(rowIndex, colIndex)}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                const cell = element?.closest('[data-cell]');
                if (cell) {
                  const row = parseInt(cell.getAttribute('data-row') || '0');
                  const col = parseInt(cell.getAttribute('data-col') || '0');
                  handleCellMove(row, col);
                }
              }}
              onMouseDown={() => handleCellStart(rowIndex, colIndex)}
              onMouseEnter={() => isSelecting && handleCellMove(rowIndex, colIndex)}
              data-cell
              data-row={rowIndex}
              data-col={colIndex}
            >
              {letter}
            </div>
          ))
        )}
      </div>

      {/* Found Words */}
      <div className="w-full max-w-md">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Palavras Encontradas ({foundWords.length})</h3>
        <div className="flex flex-wrap gap-2">
          {foundWords.map((word, index) => (
            <div 
              key={index}
              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {word} (+{getPointsForWord(word)})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
