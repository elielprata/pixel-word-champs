
import { supabase } from '@/integrations/supabase/client';
import { dailyCompetitionParticipationService } from './dailyCompetitionParticipation';
import { logger } from '@/utils/logger';

export class DailyCompetitionFinalizationService {
  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    try {
      logger.info('Finalizando competição diária (nova dinâmica - sem ranking diário)', { competitionId }, 'DAILY_COMPETITION_FINALIZATION');

      // Buscar informações da competição diária
      const { data: competition, error: compError } = await supabase
        .from('custom_competitions')
        .select('*, weekly_tournament_id')
        .eq('id', competitionId)
        .single();

      if (compError || !competition) {
        logger.error('Competição não encontrada', { error: compError, competitionId }, 'DAILY_COMPETITION_FINALIZATION');
        return;
      }

      // Verificar se há competição semanal vinculada
      if (!competition.weekly_tournament_id) {
        logger.error('Competição diária não está vinculada a uma competição semanal', { competitionId }, 'DAILY_COMPETITION_FINALIZATION');
        return;
      }

      // Como não há ranking diário separado, atualizar apenas os rankings da competição semanal
      await dailyCompetitionParticipationService.updateCompetitionRankings(competition.weekly_tournament_id);
      logger.info('Rankings da competição semanal atualizados', { weeklyTournamentId: competition.weekly_tournament_id }, 'DAILY_COMPETITION_FINALIZATION');

      // Finalizar a competição diária
      await supabase
        .from('custom_competitions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId);

      logger.info('Competição diária finalizada com sucesso (pontos já na competição semanal)', { competitionId }, 'DAILY_COMPETITION_FINALIZATION');
    } catch (error) {
      logger.error('Erro ao finalizar competição diária', { error, competitionId }, 'DAILY_COMPETITION_FINALIZATION');
    }
  }

  async transferScoresToWeeklyCompetition(dailyCompetitionId: string): Promise<void> {
    try {
      logger.info('Com a nova dinâmica, não há transferência de pontos - os pontos já são contabilizados diretamente na competição semanal', { dailyCompetitionId }, 'DAILY_COMPETITION_FINALIZATION');

      // Buscar competição diária e sua vinculação semanal para validação
      const { data: dailyCompetition, error: dailyError } = await supabase
        .from('custom_competitions')
        .select('weekly_tournament_id, title')
        .eq('id', dailyCompetitionId)
        .single();

      if (dailyError || !dailyCompetition?.weekly_tournament_id) {
        logger.warn('Competição diária não vinculada a competição semanal', { dailyCompetitionId, error: dailyError }, 'DAILY_COMPETITION_FINALIZATION');
        return;
      }

      logger.info('Competição diária está corretamente vinculada à competição semanal', { 
        title: dailyCompetition.title || 'Sem título',
        weeklyTournamentId: dailyCompetition.weekly_tournament_id 
      }, 'DAILY_COMPETITION_FINALIZATION');
      logger.info('Os pontos são transferidos automaticamente em tempo real durante o jogo', undefined, 'DAILY_COMPETITION_FINALIZATION');
    } catch (error) {
      logger.error('Erro ao verificar vinculação', { error, dailyCompetitionId }, 'DAILY_COMPETITION_FINALIZATION');
    }
  }
}

export const dailyCompetitionFinalizationService = new DailyCompetitionFinalizationService();
