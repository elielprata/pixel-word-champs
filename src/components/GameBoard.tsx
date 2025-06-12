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
import { logger } from '@/utils/logger';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  logger.debug('Renderizando GameBoard', { 
    level, 
    timeLeft, 
    canRevive 
  }, 'GAME_BOARD');

  // Usar palavras do banco de dados através do useBoard
  const { boardData, size, levelWords, isLoading, error, debugInfo } = useBoard(level);
  
  const { 
    selectedCells, 
    isSelecting, 
    handleCellStart, 
    handleCellMove, 
    handleCellEnd, 
    isCellSelected 
  } = useBoardInteraction();
  
  const { isValidWordDirection } = useWordValidation();

  const {
    foundWords,
    hintsUsed,
    showGameOver,
    showLevelComplete,
    isLevelCompleted,
    setHintsUsed,
    setShowGameOver,
    setHintHighlightedCells,
    addFoundWord,
    isCellPermanentlyMarked,
    isCellHintHighlighted,
    closeGameOver
  } = useGameLogic(level, timeLeft, levelWords, onWordFound, (levelScore) => {
    logger.info('Nível completado', { 
      level, 
      levelScore,
      foundWordsCount: foundWords.length 
    }, 'GAME_BOARD');
    onLevelComplete(levelScore);
  });

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

  // Mostrar loading enquanto carrega
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">Preparando Jogo</h3>
                <p className="text-sm text-muted-foreground">Nível {level}</p>
                {debugInfo && (
                  <p className="text-xs text-muted-foreground mt-2">{debugInfo}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Erro ao carregar o jogo:</strong></p>
                <p className="text-sm">{error}</p>
                {debugInfo && (
                  <p className="text-xs opacity-75">Debug: {debugInfo}</p>
                )}
                <Button 
                  onClick={() => window.location.reload()} 
                  size="sm" 
                  className="mt-2"
                >
                  Tentar Novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleCellEndWithValidation = () => {
    const finalSelection = handleCellEnd();
    
    if (finalSelection.length >= 3) {
      const word = finalSelection.map(pos => boardData.board[pos.row][pos.col]).join('');
      
      if (levelWords.includes(word) && 
          !foundWords.some(fw => fw.word === word) && 
          isValidWordDirection(finalSelection)) {
        logger.info('Palavra encontrada', { 
          word, 
          level,
          wordLength: word.length,
          selectionLength: finalSelection.length 
        }, 'GAME_BOARD');
        addFoundWord(word, finalSelection);
      } else {
        logger.debug('Palavra inválida tentada', { 
          word,
          level,
          isInWordList: levelWords.includes(word),
          alreadyFound: foundWords.some(fw => fw.word === word),
          validDirection: isValidWordDirection(finalSelection)
        }, 'GAME_BOARD');
      }
    }
  };

  const handleCellMoveWithValidation = (row: number, col: number) => {
    handleCellMove(row, col, isValidWordDirection);
  };

  const handleReviveClick = () => {
    if (onRevive) {
      logger.info('Revive ativado', { 
        level,
        timeLeft,
        foundWordsCount: foundWords.length 
      }, 'GAME_BOARD');
      onRevive();
      closeGameOver();
    }
  };

  const handleUseHintClick = () => {
    logger.info('Dica utilizada', { 
      level,
      hintsUsed: hintsUsed + 1,
      timeLeft 
    }, 'GAME_BOARD');
    useHint();
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

  // Calcular pontuação atual do nível (palavras encontradas)
  const currentLevelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);

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
            levelScore={currentLevelScore}
            onUseHint={handleUseHintClick}
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
