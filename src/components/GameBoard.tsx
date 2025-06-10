
import React from 'react';
import GameProgressBar from './game/GameProgressBar';
import GameStats from './game/GameStats';
import WordsList from './game/WordsList';
import GameBoardGrid from './game/GameBoardGrid';
import GameModals from './game/GameModals';
import { useBoard } from '@/hooks/useBoard';
import { useBoardInteraction } from '@/hooks/useBoardInteraction';
import { useWordValidation } from '@/hooks/useWordValidation';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useGameInteractions } from '@/hooks/useGameInteractions';
import { type Position } from '@/utils/boardUtils';
import { useState } from 'react';

interface GameBoardProps {
  level: number;
  timeLeft: number;
  onWordFound: (word: string, points: number) => void;
  onTimeUp: () => void;
  onLevelComplete: (levelScore: number) => void;
  onAdvanceLevel: () => void;
  onStopGame: () => void;
  canRevive?: boolean;
  onRevive?: () => void;
}

const GameBoard = ({ 
  level, 
  timeLeft, 
  onWordFound, 
  onTimeUp, 
  onLevelComplete, 
  onAdvanceLevel, 
  onStopGame,
  canRevive = true,
  onRevive
}: GameBoardProps) => {
  // Estados locais do jogo
  const [foundWords, setFoundWords] = useState<Array<{word: string, points: number, positions: Position[]}>>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [hintHighlightedCells, setHintHighlightedCells] = useState<Position[]>([]);

  // Hooks existentes
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

  // Hook simplificado do jogo
  const {
    board,
    wordsToFind,
    wordsFound,
    currentScore,
    isLoading,
    error,
    isGameComplete,
    findWord
  } = useGameLogic({
    level,
    competitionId: undefined
  }, onLevelComplete);

  // Verificar se o nível foi completado
  const isLevelCompleted = foundWords.length === levelWords.length;

  // Função para adicionar palavra encontrada
  const addFoundWord = (word: string, positions: Position[]) => {
    const points = word.length * 10; // Pontuação simples
    const newWord = { word, points, positions };
    setFoundWords(prev => [...prev, newWord]);
    onWordFound(word, points);
    
    // Verificar se completou o nível
    if (foundWords.length + 1 === levelWords.length) {
      setShowLevelComplete(true);
    }
  };

  // Verificar se uma célula está permanentemente marcada
  const isCellPermanentlyMarked = (row: number, col: number) => {
    return foundWords.some(fw => 
      fw.positions.some(pos => pos.row === row && pos.col === col)
    );
  };

  // Verificar se uma célula está destacada por dica
  const isCellHintHighlighted = (row: number, col: number) => {
    return hintHighlightedCells.some(pos => pos.row === row && pos.col === col);
  };

  // Fechar modal de game over
  const closeGameOver = () => {
    setShowGameOver(false);
  };

  const { useHint, handleRevive, handleGoHome } = useGameInteractions(
    foundWords,
    levelWords,
    boardData,
    hintsUsed,
    setHintsUsed,
    setHintHighlightedCells,
    canRevive,
    () => {}, 
    setShowGameOver,
    onTimeUp
  );

  const handleCellEndWithValidation = () => {
    const finalSelection = handleCellEnd();
    
    if (finalSelection.length >= 3) {
      const word = finalSelection.map(pos => boardData.board[pos.row][pos.col]).join('');
      
      if (levelWords.includes(word) && 
          !foundWords.some(fw => fw.word === word) && 
          isValidWordDirection(finalSelection)) {
        addFoundWord(word, finalSelection);
      }
    }
  };

  const handleCellMoveWithValidation = (row: number, col: number) => {
    handleCellMove(row, col, isValidWordDirection);
  };

  const handleReviveClick = () => {
    if (onRevive) {
      console.log('Iniciando processo de revive...');
      onRevive();
      closeGameOver();
    }
  };

  // Função para obter a cor específica de uma palavra encontrada
  const getWordColor = (wordIndex: number) => {
    const colors = [
      'from-emerald-400 to-green-500',
      'from-blue-400 to-indigo-500', 
      'from-purple-400 to-violet-500',
      'from-pink-400 to-rose-500',
      'from-orange-400 to-amber-500',
      'from-cyan-400 to-teal-500',
      'from-red-400 to-pink-500',
      'from-lime-400 to-green-500'
    ];
    return colors[wordIndex % colors.length];
  };

  // Função para verificar se uma célula pertence a uma palavra específica
  const getCellWordIndex = (row: number, col: number) => {
    return foundWords.findIndex(fw => 
      fw.positions.some(pos => pos.row === row && pos.col === col)
    );
  };

  // Calcular pontuação que será exibida (só conta se nível completado)
  const displayScore = isLevelCompleted ? foundWords.reduce((sum, fw) => sum + fw.points, 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header com progresso */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
          <GameProgressBar 
            level={level}
            foundWords={foundWords.length}
            totalWords={levelWords.length}
          />
          
          <GameStats 
            timeLeft={timeLeft}
            hintsUsed={hintsUsed}
            totalScore={displayScore}
            onUseHint={useHint}
          />
        </div>

        {/* Tabuleiro principal */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30">
          <GameBoardGrid
            boardData={boardData}
            size={size}
            selectedCells={selectedCells}
            isSelecting={isSelecting}
            isCellSelected={isCellSelected}
            isCellPermanentlyMarked={isCellPermanentlyMarked}
            isCellHintHighlighted={isCellHintHighlighted}
            handleCellStart={handleCellStart}
            handleCellMove={handleCellMoveWithValidation}
            handleCellEndWithValidation={handleCellEndWithValidation}
            getWordColor={getWordColor}
            getCellWordIndex={getCellWordIndex}
          />
        </div>

        {/* Lista de palavras */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <WordsList 
            levelWords={levelWords}
            foundWords={foundWords}
            getWordColor={getWordColor}
          />
        </div>

        <GameModals
          showGameOver={showGameOver}
          showLevelComplete={showLevelComplete}
          foundWords={foundWords}
          level={level}
          canRevive={canRevive}
          onRevive={handleReviveClick}
          onGoHome={handleGoHome}
          onAdvanceLevel={onAdvanceLevel}
          onStopGame={onStopGame}
        />
      </div>
    </div>
  );
};

export default GameBoard;
