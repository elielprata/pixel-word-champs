
import { useReducer, useEffect } from 'react';

interface GameState {
  currentLevel: number;
  timeRemaining: number;
  isGameStarted: boolean;
  showInstructions: boolean;
  score: number;
  currentLevelScore: number;
  completedChallenges: Set<number>;
  isAdvancing: boolean;
}

type GameAction = 
  | { type: 'START_GAME' }
  | { type: 'RESET_TO_HOME' }
  | { type: 'SET_CURRENT_LEVEL_SCORE'; payload: number }
  | { type: 'UPDATE_CURRENT_LEVEL_SCORE'; payload: (prev: number) => number }
  | { type: 'ADVANCE_LEVEL'; payload: { nextLevel: number; newScore: number } }
  | { type: 'COMPLETE_CHALLENGE'; challengeId: number }
  | { type: 'SET_ADVANCING'; payload: boolean }
  | { type: 'TICK_TIMER' }
  | { type: 'RESET_FOR_CHALLENGE'; challengeId: number };

const initialState: GameState = {
  currentLevel: 1,
  timeRemaining: 180,
  isGameStarted: false,
  showInstructions: true,
  score: 0,
  currentLevelScore: 0,
  completedChallenges: new Set(),
  isAdvancing: false
};

function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        showInstructions: false,
        isGameStarted: true,
        score: 0,
        currentLevelScore: 0
      };
    
    case 'RESET_TO_HOME':
      return {
        ...initialState,
        completedChallenges: state.completedChallenges
      };
    
    case 'SET_CURRENT_LEVEL_SCORE':
      return {
        ...state,
        currentLevelScore: action.payload
      };
    
    case 'UPDATE_CURRENT_LEVEL_SCORE':
      return {
        ...state,
        currentLevelScore: action.payload(state.currentLevelScore)
      };
    
    case 'ADVANCE_LEVEL':
      return {
        ...state,
        currentLevel: action.payload.nextLevel,
        score: action.payload.newScore,
        timeRemaining: 180,
        currentLevelScore: 0,
        isAdvancing: false
      };
    
    case 'COMPLETE_CHALLENGE':
      return {
        ...state,
        completedChallenges: new Set([...state.completedChallenges, action.challengeId]),
        isAdvancing: false
      };
    
    case 'SET_ADVANCING':
      return {
        ...state,
        isAdvancing: action.payload
      };
    
    case 'TICK_TIMER':
      return {
        ...state,
        timeRemaining: Math.max(0, state.timeRemaining - 1)
      };
    
    case 'RESET_FOR_CHALLENGE':
      return {
        ...initialState,
        completedChallenges: state.completedChallenges
      };
    
    default:
      return state;
  }
}

export const useChallengeGameState = (challengeId: number) => {
  const [state, dispatch] = useReducer(gameStateReducer, initialState);

  // Timer effect
  useEffect(() => {
    if (state.isGameStarted && state.timeRemaining > 0) {
      const timer = setInterval(() => {
        dispatch({ type: 'TICK_TIMER' });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.isGameStarted, state.timeRemaining]);

  // Reset to level 1 when component mounts (when entering the challenge)
  useEffect(() => {
    dispatch({ type: 'RESET_FOR_CHALLENGE', challengeId });
  }, [challengeId]);

  const startGame = () => {
    dispatch({ type: 'START_GAME' });
  };

  const resetToHome = () => {
    dispatch({ type: 'RESET_TO_HOME' });
  };

  const setCurrentLevelScore = (value: number | ((prev: number) => number)) => {
    if (typeof value === 'function') {
      dispatch({ type: 'UPDATE_CURRENT_LEVEL_SCORE', payload: value });
    } else {
      dispatch({ type: 'SET_CURRENT_LEVEL_SCORE', payload: value });
    }
  };

  const advanceLevel = () => {
    if (state.isAdvancing) {
      console.log('Already advancing level, ignoring duplicate call');
      return false;
    }

    dispatch({ type: 'SET_ADVANCING', payload: true });
    
    const newScore = state.score + state.currentLevelScore;
    console.log(`Total score updated: ${state.score} + ${state.currentLevelScore} = ${newScore}`);
    
    if (state.currentLevel < 20) {
      const nextLevel = state.currentLevel + 1;
      console.log(`Advancing from level ${state.currentLevel} to ${nextLevel}`);
      
      // Use setTimeout to prevent state update conflicts
      setTimeout(() => {
        dispatch({ 
          type: 'ADVANCE_LEVEL', 
          payload: { nextLevel, newScore }
        });
      }, 50);
      
      return false;
    } else {
      console.log('Desafio completado! Todos os níveis foram concluídos.');
      dispatch({ type: 'SET_ADVANCING', payload: false });
      return true; // Indicates challenge completed
    }
  };

  const stopGame = () => {
    dispatch({ type: 'COMPLETE_CHALLENGE', challengeId });
    console.log(`Usuário parou no desafio ${challengeId}`);
    return true;
  };

  return {
    currentLevel: state.currentLevel,
    timeRemaining: state.timeRemaining,
    isGameStarted: state.isGameStarted,
    showInstructions: state.showInstructions,
    score: state.score,
    currentLevelScore: state.currentLevelScore,
    completedChallenges: state.completedChallenges,
    isAdvancing: state.isAdvancing,
    setCurrentLevelScore,
    startGame,
    resetToHome,
    advanceLevel,
    stopGame
  };
};
