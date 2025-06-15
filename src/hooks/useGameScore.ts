
import { useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface FoundWord {
  word: string;
  positions: Array<{row: number, col: number}>;
  points: number;
}

export const useGameScore = (foundWords: FoundWord[]) => {
  // Memoizar pontuação total
  const currentLevelScore = useMemo(() => {
    return foundWords.reduce((sum, fw) => sum + fw.points, 0);
  }, [foundWords]);

  const updateUserScore = useCallback(async (points: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('total_score, games_played')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        logger.error('Erro ao buscar perfil:', fetchError);
        return;
      }

      const currentScore = profile?.total_score || 0;
      const newScore = currentScore + points;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          total_score: newScore,
          games_played: (profile?.games_played || 0) + 1
        })
        .eq('id', user.id);

      if (updateError) {
        logger.error('Erro ao atualizar pontuação:', updateError);
        return;
      }

      logger.info(`Pontuação atualizada: ${currentScore} → ${newScore} (+${points})`);
    } catch (error) {
      logger.error('Erro ao atualizar pontuação do usuário:', error);
    }
  }, []);

  return {
    currentLevelScore,
    updateUserScore
  };
};
