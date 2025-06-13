
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

export const useWeeklyCompetitionAutoParticipation = () => {
  const { user } = useAuth();
  const [activeWeeklyCompetition, setActiveWeeklyCompetition] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      checkAndJoinActiveWeeklyCompetition();
    }
  }, [user?.id]);

  const checkAndJoinActiveWeeklyCompetition = async () => {
    if (!user?.id) return;

    try {
      logger.debug('Verificando competição semanal ativa para auto-participação', { userId: user.id }, 'WEEKLY_AUTO_PARTICIPATION');

      // Buscar competição semanal ativa
      const { data: competitions, error: competitionError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'tournament')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (competitionError) {
        logger.error('Erro ao buscar competição semanal ativa', { error: competitionError }, 'WEEKLY_AUTO_PARTICIPATION');
        return;
      }

      if (!competitions || competitions.length === 0) {
        logger.debug('Nenhuma competição semanal ativa encontrada', undefined, 'WEEKLY_AUTO_PARTICIPATION');
        return;
      }

      const competition = competitions[0];
      setActiveWeeklyCompetition(competition);

      // Verificar se usuário já está participando
      const { data: participation, error: participationError } = await supabase
        .from('competition_participations')
        .select('*')
        .eq('competition_id', competition.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (participationError) {
        logger.error('Erro ao verificar participação', { error: participationError }, 'WEEKLY_AUTO_PARTICIPATION');
        return;
      }

      if (!participation) {
        // Inscrever automaticamente na competição semanal
        const { data: newParticipation, error: insertError } = await supabase
          .from('competition_participations')
          .insert({
            competition_id: competition.id,
            user_id: user.id,
            user_score: 0
          })
          .select()
          .single();

        if (insertError) {
          logger.error('Erro ao inscrever automaticamente na competição semanal', { error: insertError }, 'WEEKLY_AUTO_PARTICIPATION');
          return;
        }

        logger.info('Usuário inscrito automaticamente na competição semanal', { 
          competitionId: competition.id,
          participationId: newParticipation.id 
        }, 'WEEKLY_AUTO_PARTICIPATION');
      } else {
        logger.debug('Usuário já está participando da competição semanal', { 
          competitionId: competition.id,
          participationId: participation.id 
        }, 'WEEKLY_AUTO_PARTICIPATION');
      }

    } catch (error) {
      logger.error('Erro na auto-participação semanal', { error }, 'WEEKLY_AUTO_PARTICIPATION');
    }
  };

  const updateWeeklyScore = async (newScore: number) => {
    if (!user?.id || !activeWeeklyCompetition) return;

    try {
      logger.debug('Atualizando pontuação na competição semanal', { 
        userId: user.id,
        competitionId: activeWeeklyCompetition.id,
        newScore 
      }, 'WEEKLY_SCORE_UPDATE');

      const { error } = await supabase
        .from('competition_participations')
        .update({ user_score: newScore })
        .eq('competition_id', activeWeeklyCompetition.id)
        .eq('user_id', user.id);

      if (error) {
        logger.error('Erro ao atualizar pontuação semanal', { error }, 'WEEKLY_SCORE_UPDATE');
        return;
      }

      logger.info('Pontuação semanal atualizada com sucesso', { 
        userId: user.id,
        competitionId: activeWeeklyCompetition.id,
        newScore 
      }, 'WEEKLY_SCORE_UPDATE');

    } catch (error) {
      logger.error('Erro na atualização de pontuação semanal', { error }, 'WEEKLY_SCORE_UPDATE');
    }
  };

  return {
    activeWeeklyCompetition,
    updateWeeklyScore,
    refetch: checkAndJoinActiveWeeklyCompetition
  };
};
