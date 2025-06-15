
import { useState, useEffect } from 'react';
import { type Position } from '@/utils/boardUtils';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Position[];
  points: number;
}

interface GameState {
  foundWords: FoundWord[];
  hintsUsed: number;
  showGameOver: boolean;
  showLevelComplete: boolean;
  hintHighlightedCells: Position[];
  permanentlyMarkedCells: Position[];
  isLevelCompleted: boolean;
}

export const useGameState = (level: number, timeLeft: number) => {
  const [state, setState] = useState<GameState>({
    foundWords: [],
    hintsUsed: 0,
    showGameOver: false,
    showLevelComplete: false,
    hintHighlightedCells: [],
    permanentlyMarkedCells: [],
    isLevelCompleted: false
  });

  // ETAPA 3: Sempre verificar se completou 5 palavras
  const TOTAL_WORDS = 5;

  // Reset state quando muda o nível
  useEffect(() => {
    logger.info(`🔄 Resetando estado do jogo para nível ${level}`, { level }, 'GAME_STATE');
    setState({
      foundWords: [],
      hintsUsed: 0,
      showGameOver: false,
      showLevelComplete: false,
      hintHighlightedCells: [],
      permanentlyMarkedCells: [],
      isLevelCompleted: false
    });
  }, [level]);

  // Game Over quando tempo acaba (só se não completou o nível)
  useEffect(() => {
    if (timeLeft === 0 && !state.showGameOver && !state.isLevelCompleted) {
      logger.info('⏰ Tempo esgotado - Game Over', { 
        level, 
        foundWords: state.foundWords.length,
        totalWords: TOTAL_WORDS 
      }, 'GAME_STATE');
      setState(prev => ({ ...prev, showGameOver: true }));
    }
  }, [timeLeft, state.showGameOver, state.isLevelCompleted, level, state.foundWords.length]);

  // ETAPA 3: Lógica de level complete corrigida - sempre verificar 5 palavras
  useEffect(() => {
    if (state.foundWords.length === TOTAL_WORDS && !state.showLevelComplete && !state.isLevelCompleted) {
      const levelScore = state.foundWords.reduce((sum, fw) => sum + fw.points, 0);
      
      logger.info(`🎉 Nível ${level} COMPLETADO!`, {
        level,
        foundWordsCount: state.foundWords.length,
        totalWordsRequired: TOTAL_WORDS,
        foundWords: state.foundWords.map(fw => fw.word),
        levelScore
      }, 'GAME_STATE');
      
      setState(prev => ({ 
        ...prev, 
        showLevelComplete: true, 
        isLevelCompleted: true 
      }));
      
      // Registrar pontos no banco quando completa o nível
      updateUserScore(levelScore);
    }
  }, [state.foundWords.length, state.showLevelComplete, state.isLevelCompleted, state.foundWords, level]);

  const updateUserScore = async (points: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('⚠️ Usuário não autenticado, não é possível atualizar pontuação');
        return;
      }

      logger.info(`🔄 Registrando pontuação do nível completado: +${points} pontos`);

      // Buscar pontuação atual do usuário
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('total_score, games_played')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        logger.error('❌ Erro ao buscar perfil:', fetchError);
        return;
      }

      const currentScore = profile?.total_score || 0;
      const newScore = currentScore + points;

      // Atualizar pontuação no perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          total_score: newScore,
          games_played: (profile?.games_played || 0) + 1
        })
        .eq('id', user.id);

      if (updateError) {
        logger.error('❌ Erro ao atualizar pontuação:', updateError);
        return;
      }

      logger.info(`✅ Pontuação registrada: ${currentScore} → ${newScore} (+${points})`);

      // Atualizar ranking semanal
      try {
        const { error: rankingError } = await supabase.rpc('update_weekly_ranking');
        if (rankingError) {
          logger.warn('⚠️ Erro ao atualizar ranking semanal:', rankingError);
        }
      } catch (rankingUpdateError) {
        logger.warn('⚠️ Erro ao forçar atualização do ranking:', rankingUpdateError);
      }

    } catch (error) {
      logger.error('❌ Erro ao atualizar pontuação do usuário:', error);
    }
  };

  const addFoundWord = (newFoundWord: FoundWord) => {
    // PROTEÇÃO: Verificar se a palavra já foi encontrada
    const isAlreadyFound = state.foundWords.some(fw => fw.word === newFoundWord.word);
    if (isAlreadyFound) {
      logger.warn(`⚠️ Tentativa de adicionar palavra duplicada: "${newFoundWord.word}" - IGNORANDO`, 'GAME_STATE');
      return;
    }

    logger.info(`📝 Adicionando palavra: "${newFoundWord.word}" = ${newFoundWord.points} pontos (${state.foundWords.length + 1}/${TOTAL_WORDS})`);
    
    setState(prev => ({
      ...prev,
      foundWords: [...prev.foundWords, newFoundWord],
      permanentlyMarkedCells: [...prev.permanentlyMarkedCells, ...newFoundWord.positions]
    }));
  };

  const setHintsUsed = (value: number | ((prev: number) => number)) => {
    setState(prev => ({ 
      ...prev, 
      hintsUsed: typeof value === 'function' ? value(prev.hintsUsed) : value 
    }));
  };

  const setHintHighlightedCells = (positions: Position[]) => {
    setState(prev => ({ ...prev, hintHighlightedCells: positions }));
  };

  const setShowGameOver = (value: boolean) => {
    setState(prev => ({ ...prev, showGameOver: value }));
  };

  const setShowLevelComplete = (value: boolean) => {
    setState(prev => ({ ...prev, showLevelComplete: value }));
  };

  const setIsLevelCompleted = (value: boolean) => {
    setState(prev => ({ ...prev, isLevelCompleted: value }));
  };

  return {
    ...state,
    addFoundWord,
    setHintsUsed,
    setHintHighlightedCells,
    setShowGameOver,
    setShowLevelComplete,
    setIsLevelCompleted
  };
};
