
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Clock, Lightbulb, RotateCcw, Target, Trophy, CheckCircle } from 'lucide-react';

interface Position {
  row: number;
  col: number;
}

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface GameBoardProps {
  level: number;
  timeLeft: number;
  onWordFound: (word: string, points: number) => void;
  onTimeUp: () => void;
}

const GameBoard = ({ level, timeLeft, onWordFound, onTimeUp }: GameBoardProps) => {
  const getBoardSize = (level: number) => {
    if (level === 1 || level === 2) return 5;
    if (level === 3 || level === 4) return 6;
    if (level === 5 || level === 6) return 7;
    if (level === 7 || level === 8) return 8;
    if (level === 9 || level === 10) return 9;
    return 10;
  };

  const generateBoard = (size: number) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array(size).fill(null).map(() => 
      Array(size).fill(null).map(() => 
        letters[Math.floor(Math.random() * letters.length)]
      )
    );
  };

  // Palavras do nível (5 por nível) - exemplo simples
  const getLevelWords = (level: number) => {
    const wordSets = {
      1: ['CASA', 'GATO', 'SOL', 'MAR', 'PAZ'],
      2: ['VIDA', 'AMOR', 'FLOR', 'AZUL', 'FELIZ'],
      3: ['SONHO', 'TERRA', 'VENTO', 'CHUVA', 'FLORES'],
      // Adicione mais níveis conforme necessário
    };
    return wordSets[level as keyof typeof wordSets] || ['PALAVRA', 'TESTE', 'JOGO', 'NIVEL', 'DESAFIO'];
  };

  const size = getBoardSize(level);
  const [board, setBoard] = useState(() => generateBoard(size));
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [levelWords] = useState(getLevelWords(level));
  const [permanentlyMarkedCells, setPermanentlyMarkedCells] = useState<Position[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  // Regenera o tabuleiro quando o nível muda
  useEffect(() => {
    const newSize = getBoardSize(level);
    setBoard(generateBoard(newSize));
    setSelectedCells([]);
    setFoundWords([]);
    setPermanentlyMarkedCells([]);
    setHintsUsed(0);
  }, [level]);

  // Verifica se completou o nível
  useEffect(() => {
    if (foundWords.length === 5) {
      setTimeout(() => {
        // Aqui você pode adicionar lógica para avançar para o próximo nível
        console.log('Nível completado! Avançando...');
      }, 1500);
    }
  }, [foundWords.length]);

  const getPointsForWord = (word: string) => {
    const length = word.length;
    if (length === 3) return 10;
    if (length === 4) return 20;
    if (length === 5) return 30;
    return 50 + Math.max(0, length - 6) * 10;
  };

  const handleCellStart = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const handleCellMove = (row: number, col: number) => {
    if (!isSelecting) return;
    
    const newPosition = { row, col };
    setSelectedCells(prev => {
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
      
      // Verifica se a palavra está na lista do nível e ainda não foi encontrada
      if (levelWords.includes(word) && !foundWords.some(fw => fw.word === word)) {
        const points = getPointsForWord(word);
        const newFoundWord = { word, positions: [...selectedCells], points };
        
        setFoundWords(prev => [...prev, newFoundWord]);
        setPermanentlyMarkedCells(prev => [...prev, ...selectedCells]);
        onWordFound(word, points);
      }
    }
    setIsSelecting(false);
    setSelectedCells([]);
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(pos => pos.row === row && pos.col === col);
  };

  const isCellPermanentlyMarked = (row: number, col: number) => {
    return permanentlyMarkedCells.some(pos => pos.row === row && pos.col === col);
  };

  const useHint = () => {
    if (hintsUsed >= 1) return;
    
    const remainingWords = levelWords.filter(word => !foundWords.some(fw => fw.word === word));
    if (remainingWords.length > 0) {
      setHintsUsed(prev => prev + 1);
      // Aqui você pode implementar a lógica de dica
      console.log(`Dica: Procure por "${remainingWords[0]}"`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCellSize = (boardSize: number) => {
    if (boardSize <= 5) return 45;
    if (boardSize <= 6) return 38;
    if (boardSize <= 7) return 33;
    if (boardSize <= 8) return 29;
    if (boardSize <= 9) return 26;
    return 23;
  };

  const cellSize = getCellSize(size);
  const progress = (foundWords.length / 5) * 100;

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      {/* Header limpo e gamificado */}
      <div className="w-full max-w-md mb-6">
        {/* Progress Bar */}
        <div className="bg-white rounded-full p-1 shadow-md mb-4">
          <div className="flex justify-between items-center px-3 py-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold text-gray-800">Nível {level}</span>
            </div>
            <div className="text-sm font-medium text-gray-600">
              {foundWords.length}/5 palavras
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-md">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-gray-800">{formatTime(timeLeft)}</span>
          </div>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="rounded-full bg-white shadow-md"
            onClick={useHint}
            disabled={hintsUsed >= 1}
          >
            <Lightbulb className="w-4 h-4" />
            {hintsUsed >= 1 ? '0' : '1'}
          </Button>
          
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-md">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-gray-800">
              {foundWords.reduce((sum, fw) => sum + fw.points, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div 
        ref={boardRef}
        className="grid p-4 bg-white rounded-2xl shadow-lg mb-6"
        style={{ 
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gap: size > 7 ? '2px' : '4px',
          maxWidth: size > 7 ? '350px' : '320px',
          width: '100%'
        }}
        onTouchEnd={handleCellEnd}
        onMouseUp={handleCellEnd}
      >
        {board.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const isSelected = isCellSelected(rowIndex, colIndex);
            const isPermanent = isCellPermanentlyMarked(rowIndex, colIndex);
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  flex items-center justify-center font-bold cursor-pointer
                  transition-all duration-200 rounded-lg border-2
                  ${isPermanent 
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-300 shadow-lg' 
                    : isSelected
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white border-purple-300 shadow-lg scale-110' 
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-200 hover:border-purple-300 hover:scale-105'
                  }
                `}
                style={{ 
                  width: `${cellSize}px`, 
                  height: `${cellSize}px`,
                  fontSize: `${Math.max(cellSize * 0.35, 10)}px`
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
            );
          })
        )}
      </div>

      {/* Words List - Design mais limpo */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 text-center">Palavras do Nível</h3>
          <div className="grid grid-cols-5 gap-2">
            {levelWords.map((word, index) => {
              const isFound = foundWords.some(fw => fw.word === word);
              return (
                <div 
                  key={index}
                  className={`
                    text-center p-2 rounded-lg transition-all duration-300
                    ${isFound 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {isFound && <CheckCircle className="w-3 h-3 mx-auto mb-1" />}
                  <div className="text-xs font-medium">{word}</div>
                  {isFound && (
                    <div className="text-xs opacity-80">
                      +{foundWords.find(fw => fw.word === word)?.points}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
