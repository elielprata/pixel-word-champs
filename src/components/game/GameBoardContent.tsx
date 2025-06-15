
import React from 'react';
import GameBoardHeader from './GameBoardHeader';
import GameBoardMainContent from './GameBoardMainContent';
import GameModals from './GameModals';
import GameBoardLogic from './GameBoardLogic';

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
      onRevive();
      closeGameOver();
    }
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
          <GameBoardHeader
            level={level}
            timeLeft={timeLeft}
            foundWords={logicProps.foundWords}
            levelWords={logicProps.levelWords}
            hintsUsed={logicProps.hintsUsed}
            currentLevelScore={logicProps.currentLevelScore}
            onUseHint={logicProps.useHint}
          />

          <GameBoardMainContent
            boardData={logicProps.boardData}
            size={logicProps.size}
            selectedCells={logicProps.selectedCells}
            isDragging={logicProps.isDragging}
            foundWords={logicProps.foundWords}
            levelWords={logicProps.levelWords}
            isCellSelected={logicProps.isCellSelected}
            isCellPermanentlyMarked={logicProps.isCellPermanentlyMarked}
            isCellHintHighlighted={logicProps.isCellHintHighlighted}
            handleCellStart={logicProps.handleCellStart}
            handleCellMoveWithValidation={logicProps.handleCellMove}
            handleCellEndWithValidation={logicProps.handleCellEnd}
            getWordColor={logicProps.getWordColor}
            getCellWordIndex={logicProps.getCellWordIndex}
          />

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
