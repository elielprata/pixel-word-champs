import { useEffect, useState } from 'react';
import { weeklyCompetitionService } from '@/services/weeklyCompetitionService';
import { useAuth } from '@/hooks/auth/useAuth';
import { logger } from '@/utils/logger';

export const useWeeklyCompetitionAutoParticipation = () => {
  const { user } = useAuth();
  const [activeWeeklyCompetition, setActiveWeeklyCompetition] = useState<any>(null);
  const [weeklyParticipation, setWeeklyParticipation] = useState<any>(null);

  const loadActiveWeeklyCompetition = async () => {
    try {
      logger.debug('Buscando competição semanal ativa', { userId: user?.id }, 'WEEKLY_COMPETITION_AUTO_PARTICIPATION');
      const response = await weeklyCompetitionService.getActiveWeeklyCompetition();

      if (response.success && response.data) {
        setActiveWeeklyCompetition(response.data);
        logger.info('Competição semanal ativa encontrada', { 
          competitionId: response.data.id,
          userId: user?.id 
        }, 'WEEKLY_COMPETITION_AUTO_PARTICIPATION');
      } else {
        setActiveWeeklyCompetition(null);
        logger.warn('Nenhuma competição semanal ativa encontrada', { 
          userId: user?.id,
          error: response.error 
        }, 'WEEKLY_COMPETITION_AUTO_PARTICIPATION');
      }
    } catch (error) {
      setActiveWeeklyCompetition(null);
      logger.error('Erro ao buscar competição semanal ativa', { 
        userId: user?.id,
        error 
      }, 'WEEKLY_COMPETITION_AUTO_PARTICIPATION');
    }
  };

  const participateInWeeklyCompetition = async () => {
    if (!user?.id || !activeWeeklyCompetition?.id) return;

    try {
      logger.info('Participando automaticamente da competição semanal', { 
        userId: user.id,
        competitionId: activeWeeklyCompetition.id 
      }, 'WEEKLY_COMPETITION_AUTO_PARTICIPATION');

      const response = await weeklyCompetitionService.participateInWeeklyCompetition(activeWeeklyCompetition.id);

      if (response.success && response.data) {
        setWeeklyParticipation(response.data);
        logger.info('Participação na competição semanal registrada', { 
          participationId: response.data.id,
          userId: user.id,
          competitionId: activeWeeklyCompetition.id 
        }, 'WEEKLY_COMPETITION_AUTO_PARTICIPATION');
      } else {
        setWeeklyParticipation(null);
        logger.error('Erro ao participar da competição semanal', { 
          userId: user.id,
          competitionId: activeWeeklyCompetition.id,
          error: response.error 
        }, 'WEEKLY_COMPETITION_AUTO_PARTICIPATION');
      }
    } catch (error) {
      setWeeklyParticipation(null);
      logger.error('Erro ao participar da competição semanal', { 
        userId: user?.id,
        competitionId: activeWeeklyCompetition?.id,
        error 
      }, 'WEEKLY_COMPETITION_AUTO_PARTICIPATION');
    }
  };

  const updateWeeklyScore = async (newScore: number) => {
    if (!user?.id || !activeWeeklyCompetition?.id || !weeklyParticipation?.id) return;

    try {
      logger.debug('Atualizando pontuação na competição semanal', { 
        userId: user.id,
        competitionId: activeWeeklyCompetition.id,
        participationId: weeklyParticipation.id,
        newScore 
      }, 'WEEKLY_COMPETITION_AUTO_PARTICIPATION');

      const response = await weeklyCompetitionService.updateWeeklyCompetitionScore(weeklyParticipation.id, newScore);

      if (response.success) {
        logger.info('Pontuação na competição semanal atualizada', { 
          userId: user.id,
          competitionId: activeWeeklyCompetition.id,
          participationId: weeklyParticipation.id,
          newScore 
        }, 'WEEKLY_COMPETITION_AUTO_PARTICIPATION');
      } else {
        logger.error('Erro ao atualizar pontuação na competição semanal', { 
          userId: user.id,
          competitionId: activeWeeklyCompetition.id,
          participationId: weeklyParticipation.id,
          error: response.error 
        }, 'WEEKLY_COMPETITION_AUTO_PARTICIPATION');
      }
    } catch (error) {
      logger.error('Erro ao atualizar pontuação na competição semanal', { 
        userId: user?.id,
        competitionId: activeWeeklyCompetition?.id,
        participationId: weeklyParticipation?.id,
        error 
      }, 'WEEKLY_COMPETITION_AUTO_PARTICIPATION');
    }
  };

  useEffect(() => {
    loadActiveWeeklyCompetition();
  }, [user]);

  useEffect(() => {
    if (activeWeeklyCompetition && user) {
      participateInWeeklyCompetition();
    }
  }, [activeWeeklyCompetition, user]);

  return {
    activeWeeklyCompetition,
    weeklyParticipation,
    updateWeeklyScore
  };
};
