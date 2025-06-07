import React, { useState, useRef, useEffect } from 'react';
import GameProgressBar from './game/GameProgressBar';
import GameStats from './game/GameStats';
import GameCell from './game/GameCell';
import WordsList from './game/WordsList';
import GameOverModal from './game/GameOverModal';
import LevelCompleteModal from './game/LevelCompleteModal';
import { useBoard } from '@/hooks/useBoard';
import { useBoardInteraction } from '@/hooks/useBoardInteraction';
import { useWordValidation } from '@/hooks/useWordValidation';
import { getCellSize, getPointsForWord, type Position } from '@/utils/boardUtils';

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
  onLevelComplete: (levelScore: number) => void;
  onAdvanceLevel: () => void;
  onStopGame: () => void;
}

const GameBoard = ({ level, timeLeft, onWordFound, onTimeUp, onLevelComplete, onAdvanceLevel, onStopGame }: GameBoardProps) => {
  const { boardData, size, levelWords } = useBoard(level);
  const { 
    selectedCells, 
    isSelecting, 
    handleCellStart, 
    handleCellMove, 
    handleCellEnd, 
    isCellSelected 
  } = useBoardInteraction();
  const { isValidWordDirection } = useWordValidation();

  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [permanentlyMarkedCells, setPermanentlyMarkedCells] = useState<Position[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [canRevive, setCanRevive] = useState(true);
  const [hintHighlightedCells, setHintHighlightedCells] = useState<Position[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);

  // Reset state when level changes
  useEffect(() => {
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
    if (foundWords.length === 5 && !showLevelComplete) {
      const levelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);
      setShowLevelComplete(true);
      onLevelComplete(levelScore);
    }
  }, [foundWords.length, showLevelComplete, foundWords, onLevelComplete]);

  const handleCellEndWithValidation = () => {
    const finalSelection = handleCellEnd();
    
    if (finalSelection.length >= 3) {
      const word = finalSelection.map(pos => boardData.board[pos.row][pos.col]).join('');
      
      // Verificar se é uma palavra válida e se a direção é permitida
      if (levelWords.includes(word) && 
          !foundWords.some(fw => fw.word === word) && 
          isValidWordDirection(finalSelection)) {
        const points = getPointsForWord(word);
        const newFoundWord = { word, positions: [...finalSelection], points };
        
        setFoundWords(prev => [...prev, newFoundWord]);
        setPermanentlyMarkedCells(prev => [...prev, ...finalSelection]);
        onWordFound(word, points);
      }
    }
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
      
      // Encontrar a primeira palavra não encontrada e destacar suas posições
      const hintWord = remainingWords[0];
      const wordPlacement = boardData.placedWords.find(pw => pw.word === hintWord);
      
      if (wordPlacement) {
        setHintHighlightedCells(wordPlacement.positions);
        
        // Remover o destaque após 3 segundos
        setTimeout(() => {
          setHintHighlightedCells([]);
        }, 3000);
      }
      
      console.log(`Dica: Procure por "${hintWord}"`);
    }
  };

  const handleAdvanceLevelClick = () => {
    setShowLevelComplete(false);
    onAdvanceLevel();
  };

  const handleStayLevel = () => {
    setShowLevelComplete(false);
    onStopGame();
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

  const cellSize = getCellSize(size);

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
          width: '100%',
          touchAction: 'none' // Previne zoom e outros gestos
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleCellEndWithValidation();
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          handleCellEndWithValidation();
        }}
      >
        {boardData.board.map((row, rowIndex) =>
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
              onCellMove={(row, col) => handleCellMove(row, col, isValidWordDirection)}
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

      <LevelCompleteModal
        isOpen={showLevelComplete}
        level={level}
        score={foundWords.reduce((sum, fw) => sum + fw.points, 0)}
        onAdvance={handleAdvanceLevelClick}
        onStay={handleStayLevel}
      />
    </div>
  );
};

export default GameBoard;
