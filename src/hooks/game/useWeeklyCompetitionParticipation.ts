import { useState } from 'react';
import { weeklyCompetitionService } from '@/services/weeklyCompetitionService';
import { useAuth } from '@/hooks/auth/useAuth';
import { WeeklyParticipation } from '@/types';
import { logger } from '@/utils/logger';

export const useWeeklyCompetitionParticipation = () => {
  const { user } = useAuth();
  const [participation, setParticipation] = useState<WeeklyParticipation | null>(null);

  const getParticipation = async (competitionId: string) => {
    if (!user?.id) return null;

    try {
      logger.debug('Buscando participação do usuário na competição semanal', { 
        userId: user.id,
        competitionId 
      }, 'WEEKLY_COMPETITION_PARTICIPATION');

      const response = await weeklyCompetitionService.getParticipation(competitionId, user.id);

      if (response.success && response.data) {
        setParticipation(response.data);
        logger.info('Participação encontrada', { 
          participationId: response.data.id,
          score: response.data.total_score 
        }, 'WEEKLY_COMPETITION_PARTICIPATION');
        return response.data;
      } else {
        logger.warn('Participação não encontrada', { 
          userId: user.id,
          competitionId,
          error: response.error 
        }, 'WEEKLY_COMPETITION_PARTICIPATION');
        return null;
      }
    } catch (error) {
      logger.error('Erro ao buscar participação', { 
        userId: user.id,
        competitionId,
        error 
      }, 'WEEKLY_COMPETITION_PARTICIPATION');
      return null;
    }
  };

  const participate = async (competitionId: string) => {
    if (!user?.id) return null;

    try {
      logger.info('Participando da competição semanal', { 
        userId: user.id,
        competitionId 
      }, 'WEEKLY_COMPETITION_PARTICIPATION');

      const response = await weeklyCompetitionService.participate(competitionId, user.id);

      if (response.success && response.data) {
        setParticipation(response.data);
        logger.info('Participação criada com sucesso', { 
          participationId: response.data.id,
          score: response.data.total_score 
        }, 'WEEKLY_COMPETITION_PARTICIPATION');
        return response.data;
      } else {
        logger.error('Erro ao participar da competição', { 
          userId: user.id,
          competitionId,
          error: response.error 
        }, 'WEEKLY_COMPETITION_PARTICIPATION');
        return null;
      }
    } catch (error) {
      logger.error('Erro ao participar da competição', { 
        userId: user.id,
        competitionId,
        error 
      }, 'WEEKLY_COMPETITION_PARTICIPATION');
      return null;
    }
  };

  const updateScore = async (competitionId: string, newScore: number) => {
    if (!user?.id || !participation?.id) return null;

    try {
      logger.debug('Atualizando pontuação na competição semanal', { 
        userId: user.id,
        competitionId,
        participationId: participation.id,
        newScore 
      }, 'WEEKLY_COMPETITION_PARTICIPATION');

      const response = await weeklyCompetitionService.updateScore(participation.id, newScore);

      if (response.success && response.data) {
        setParticipation(response.data);
        logger.info('Pontuação atualizada com sucesso', { 
          participationId: response.data.id,
          newScore: response.data.total_score 
        }, 'WEEKLY_COMPETITION_PARTICIPATION');
        return response.data;
      } else {
        logger.error('Erro ao atualizar pontuação', { 
          userId: user.id,
          competitionId,
          participationId: participation.id,
          error: response.error 
        }, 'WEEKLY_COMPETITION_PARTICIPATION');
        return null;
      }
    } catch (error) {
      logger.error('Erro ao atualizar pontuação', { 
        userId: user.id,
        competitionId,
        participationId: participation.id,
        error 
      }, 'WEEKLY_COMPETITION_PARTICIPATION');
      return null;
    }
  };

  return {
    participation,
    getParticipation,
    participate,
    updateScore
  };
};
