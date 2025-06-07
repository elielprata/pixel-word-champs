
import { useReducer, useEffect } from 'react';
import { useGameTimer } from './useGameTimer';

interface GameState {
  currentLevel: number;
  isGameStarted: boolean;
  showInstructions: boolean;
  score: number;
  currentLevelScore: number;
  completedChallenges: Set<number>;
  isAdvancing: boolean;
  completedLevelsScore: number; // Nova propriedade para rastrear pontos de níveis completados
}

type GameAction = 
  | { type: 'START_GAME' }
  | { type: 'RESET_TO_HOME' }
  | { type: 'SET_CURRENT_LEVEL_SCORE'; payload: number }
  | { type: 'UPDATE_CURRENT_LEVEL_SCORE'; payload: (prev: number) => number }
  | { type: 'ADVANCE_LEVEL'; payload: { nextLevel: number; newScore: number; completedLevelScore: number } }
  | { type: 'COMPLETE_CHALLENGE'; challengeId: number }
  | { type: 'SET_ADVANCING'; payload: boolean }
  | { type: 'RESET_FOR_CHALLENGE'; challengeId: number };

const initialState: GameState = {
  currentLevel: 1,
  isGameStarted: false,
  showInstructions: true,
  score: 0,
  currentLevelScore: 0,
  completedChallenges: new Set(),
  isAdvancing: false,
  completedLevelsScore: 0
};

function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        showInstructions: false,
        isGameStarted: true,
        score: 0,
        currentLevelScore: 0,
        completedLevelsScore: 0
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
        currentLevelScore: 0,
        isAdvancing: false,
        completedLevelsScore: state.completedLevelsScore + action.payload.completedLevelScore
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
  const { timeRemaining, extendTime, canRevive } = useGameTimer(180, state.isGameStarted);

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
    
    // Apenas os pontos do nível completado são somados ao score total
    const completedLevelScore = state.currentLevelScore;
    const newScore = state.score + completedLevelScore;
    
    console.log(`Nível ${state.currentLevel} completado! Pontos do nível: ${completedLevelScore}`);
    console.log(`Score total atualizado: ${state.score} + ${completedLevelScore} = ${newScore}`);
    
    if (state.currentLevel < 20) {
      const nextLevel = state.currentLevel + 1;
      console.log(`Avançando do nível ${state.currentLevel} para ${nextLevel}`);
      
      // Use setTimeout to prevent state update conflicts
      setTimeout(() => {
        dispatch({ 
          type: 'ADVANCE_LEVEL', 
          payload: { nextLevel, newScore, completedLevelScore }
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
    console.log(`Usuário escolheu parar no desafio ${challengeId} - marcando como concluído`);
    console.log(`Pontuação final contabilizada: ${state.completedLevelsScore} pontos (apenas níveis completados)`);
    dispatch({ type: 'COMPLETE_CHALLENGE', challengeId });
    return true;
  };

  const handleRevive = () => {
    const success = extendTime();
    if (success) {
      console.log(`Revive usado! Tempo estendido com base na configuração do painel admin`);
    }
    return success;
  };

  return {
    currentLevel: state.currentLevel,
    timeRemaining,
    isGameStarted: state.isGameStarted,
    showInstructions: state.showInstructions,
    score: state.score, // Score total (apenas níveis completados)
    currentLevelScore: state.currentLevelScore, // Score do nível atual (pode não ser contabilizado)
    completedLevelsScore: state.completedLevelsScore, // Score apenas dos níveis completados
    completedChallenges: state.completedChallenges,
    isAdvancing: state.isAdvancing,
    canRevive,
    setCurrentLevelScore,
    startGame,
    resetToHome,
    advanceLevel,
    stopGame,
    handleRevive
  };
};
