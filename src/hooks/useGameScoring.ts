
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Array<{row: number, col: number}>;
  points: number;
}

export const useGameScoring = (foundWords: FoundWord[], level: number) => {
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  
  // ETAPA 4: Constante para total de palavras necessárias
  const TOTAL_WORDS_REQUIRED = 5;
  
  // Calcular pontuação atual do nível
  const currentLevelScore = foundWords.reduce((sum, fw) => sum + fw.points, 0);
  
  // Verificar se o nível foi completado
  const isLevelCompleted = foundWords.length >= TOTAL_WORDS_REQUIRED;

  const updateUserScore = async (points: number) => {
    if (isUpdatingScore) {
      logger.warn('⚠️ Já está atualizando pontuação, ignorando nova tentativa', { points });
      return;
    }

    setIsUpdatingScore(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('⚠️ Usuário não autenticado, não é possível atualizar pontuação');
        return;
      }

      logger.info(`🔄 Registrando pontuação do nível ${level}: +${points} pontos`);

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
        } else {
          logger.info('✅ Ranking semanal atualizado');
        }
      } catch (rankingUpdateError) {
        logger.warn('⚠️ Erro ao forçar atualização do ranking:', rankingUpdateError);
      }

    } catch (error) {
      logger.error('❌ Erro ao atualizar pontuação do usuário:', error);
    } finally {
      setIsUpdatingScore(false);
    }
  };

  return {
    currentLevelScore,
    isLevelCompleted,
    TOTAL_WORDS_REQUIRED,
    updateUserScore,
    isUpdatingScore
  };
};
