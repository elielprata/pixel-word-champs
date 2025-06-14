
import React from 'react';
import GameBoardHeader from './GameBoardHeader';
import GameBoardMainContent from './GameBoardMainContent';
import GameModals from './GameModals';
import GameBoardLogic from './GameBoardLogic';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Array<{row: number, col: number}>;
  points: number;
}

interface GameBoardContentProps {
  level: number;
  timeLeft: number;
  onWordFound: (word: string, points: number) => void;
  onTimeUp: () => void;
  onLevelComplete: (levelScore: number) => void;
  onAdvanceLevel: () => void;
  onStopGame: () => void;
  canRevive: boolean;
  onRevive?: () => void;
}

const GameBoardContent = ({
  level,
  timeLeft,
  onWordFound,
  onTimeUp,
  onLevelComplete,
  onAdvanceLevel,
  onStopGame,
  canRevive,
  onRevive
}: GameBoardContentProps) => {
  const handleReviveClick = (closeGameOver: () => void) => {
    if (onRevive) {
      logger.info('Revive ativado', { 
        level,
        timeLeft 
      }, 'GAME_BOARD_CONTENT');
      onRevive();
      closeGameOver();
    }
  };

  const handleUseHintClick = (useHint: () => void) => {
    logger.info('Dica utilizada', { 
      level,
      timeLeft 
    }, 'GAME_BOARD_CONTENT');
    useHint();
  };

  return (
    <GameBoardLogic
      level={level}
      timeLeft={timeLeft}
      onWordFound={onWordFound}
      onTimeUp={onTimeUp}
      onLevelComplete={onLevelComplete}
      canRevive={canRevive}
      onRevive={onRevive}
    >
      {(logicProps) => (
        <>
          {/* Header do jogo com estatísticas */}
          <GameBoardHeader
            level={level}
            timeLeft={timeLeft}
            foundWords={logicProps.foundWords}
            levelWords={logicProps.levelWords}
            hintsUsed={logicProps.hintsUsed}
            currentLevelScore={logicProps.currentLevelScore}
            onUseHint={() => handleUseHintClick(logicProps.useHint)}
          />

          {/* Conteúdo principal do tabuleiro */}
          <GameBoardMainContent
            boardData={logicProps.boardData}
            size={logicProps.size}
            selectedCells={logicProps.selectedCells}
            previewCells={logicProps.previewCells}
            isSelecting={logicProps.isSelecting}
            foundWords={logicProps.foundWords}
            levelWords={logicProps.levelWords}
            isCellSelected={logicProps.isCellSelected}
            isCellPreviewed={logicProps.isCellPreviewed}
            isCellPermanentlyMarked={logicProps.isCellPermanentlyMarked}
            isCellHintHighlighted={logicProps.isCellHintHighlighted}
            handleCellStart={logicProps.handleCellStart}
            handleCellMoveWithValidation={logicProps.handleCellMoveWithValidation}
            handleCellEndWithValidation={logicProps.handleCellEndWithValidation}
            getWordColor={logicProps.getWordColor}
            getCellWordIndex={logicProps.getCellWordIndex}
          />

          {/* Modais do jogo */}
          <GameModals
            showGameOver={logicProps.showGameOver}
            showLevelComplete={logicProps.showLevelComplete}
            foundWords={logicProps.foundWords}
            level={level}
            canRevive={canRevive}
            onRevive={() => handleReviveClick(logicProps.closeGameOver)}
            onGoHome={logicProps.handleGoHome}
            onAdvanceLevel={onAdvanceLevel}
            onStopGame={onStopGame}
          />
        </>
      )}
    </GameBoardLogic>
  );
};

export default GameBoardContent;
