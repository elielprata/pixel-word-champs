import React, { useState, useCallback, useRef, useEffect } from 'react';
import GameProgressBar from './game/GameProgressBar';
import GameStats from './game/GameStats';
import GameCell from './game/GameCell';
import WordsList from './game/WordsList';
import GameOverModal from './game/GameOverModal';

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

  const getLevelWords = (level: number) => {
    const wordSets = {
      1: ['CASA', 'GATO', 'SOL', 'MAR', 'PAZ'],
      2: ['VIDA', 'AMOR', 'FLOR', 'AZUL', 'FELIZ'],
      3: ['SONHO', 'TERRA', 'VENTO', 'CHUVA', 'FLORES'],
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
  const [showGameOver, setShowGameOver] = useState(false);
  const [canRevive, setCanRevive] = useState(true);
  const [hintHighlightedCells, setHintHighlightedCells] = useState<Position[]>([]);
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

  // Detecta quando o tempo acaba
  useEffect(() => {
    if (timeLeft === 0 && !showGameOver) {
      setShowGameOver(true);
    }
  }, [timeLeft, showGameOver]);

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

  const isCellHintHighlighted = (row: number, col: number) => {
    return hintHighlightedCells.some(pos => pos.row === row && pos.col === col);
  };

  const useHint = () => {
    if (hintsUsed >= 1) return;
    
    const remainingWords = levelWords.filter(word => !foundWords.some(fw => fw.word === word));
    if (remainingWords.length > 0) {
      setHintsUsed(prev => prev + 1);
      
      // Simular posições da palavra (em um jogo real, você teria as posições reais)
      const hintWord = remainingWords[0];
      const mockPositions: Position[] = [];
      
      // Gerar posições mockadas para demonstração
      for (let i = 0; i < hintWord.length; i++) {
        mockPositions.push({ row: 1, col: i });
      }
      
      setHintHighlightedCells(mockPositions);
      
      // Remover o destaque após 3 segundos
      setTimeout(() => {
        setHintHighlightedCells([]);
      }, 3000);
      
      console.log(`Dica: Procure por "${hintWord}"`);
    }
  };

  const handleRevive = () => {
    if (!canRevive) return;
    
    // Simular assistir anúncio (em produção seria integrado com sistema de anúncios)
    setCanRevive(false);
    setShowGameOver(false);
    
    // Adicionar 30 segundos (isso seria feito no componente pai)
    console.log('Revive ativado! +30 segundos');
  };

  const handleGoHome = () => {
    onTimeUp();
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
      <div className="w-full max-w-md mb-6">
        <GameProgressBar 
          level={level}
          foundWords={foundWords.length}
          totalWords={5}
        />
        
        <GameStats 
          timeLeft={timeLeft}
          hintsUsed={hintsUsed}
          totalScore={foundWords.reduce((sum, fw) => sum + fw.points, 0)}
          onUseHint={useHint}
        />
      </div>

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
          row.map((letter, colIndex) => (
            <GameCell
              key={`${rowIndex}-${colIndex}`}
              letter={letter}
              rowIndex={rowIndex}
              colIndex={colIndex}
              isSelected={isCellSelected(rowIndex, colIndex)}
              isPermanent={isCellPermanentlyMarked(rowIndex, colIndex)}
              isHintHighlighted={isCellHintHighlighted(rowIndex, colIndex)}
              cellSize={cellSize}
              onCellStart={handleCellStart}
              onCellMove={handleCellMove}
              isSelecting={isSelecting}
            />
          ))
        )}
      </div>

      <WordsList 
        levelWords={levelWords}
        foundWords={foundWords}
      />

      <GameOverModal
        isOpen={showGameOver}
        score={foundWords.reduce((sum, fw) => sum + fw.points, 0)}
        wordsFound={foundWords.length}
        totalWords={5}
        onRevive={handleRevive}
        onGoHome={handleGoHome}
        canRevive={canRevive}
      />
    </div>
  );
};

export default GameBoard;
