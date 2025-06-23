
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface DailyCompetitionData {
  id: string;
  date: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'active' | 'completed';
  total_participants: number;
  prize_pool: number;
  theme?: string;
  created_at: string;
}

export interface DailyParticipation {
  id: string;
  competition_id: string;
  user_id: string;
  score: number;
  position?: number;
  words_found: string[];
  completed_at?: string;
}

class DailyCompetitionService {
  async getTodaysCompetition(): Promise<DailyCompetitionData | null> {
    const today = new Date().toISOString().split('T')[0];
    logger.debug('Buscando competição do dia', { date: today }, 'DAILY_COMPETITION_SERVICE');
    
    const { data, error } = await supabase
      .from('daily_competitions')
      .select('*')
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Erro ao buscar competição do dia', { error: error.message }, 'DAILY_COMPETITION_SERVICE');
      throw error;
    }

    if (data) {
      logger.info('Competição do dia encontrada', { id: data.id, title: data.title }, 'DAILY_COMPETITION_SERVICE');
    } else {
      logger.debug('Nenhuma competição encontrada para hoje', { date: today }, 'DAILY_COMPETITION_SERVICE');
    }

    return data;
  }

  async createDailyCompetition(competitionData: Partial<DailyCompetitionData>): Promise<DailyCompetitionData> {
    logger.info('Criando competição diária', { title: competitionData.title }, 'DAILY_COMPETITION_SERVICE');
    
    const { data, error } = await supabase
      .from('daily_competitions')
      .insert(competitionData)
      .select()
      .single();

    if (error) {
      logger.error('Erro ao criar competição diária', { error: error.message }, 'DAILY_COMPETITION_SERVICE');
      throw error;
    }

    logger.info('Competição diária criada com sucesso', { id: data.id }, 'DAILY_COMPETITION_SERVICE');
    return data;
  }

  async joinDailyCompetition(competitionId: string, userId: string): Promise<boolean> {
    logger.info('Participando de competição diária', { competitionId, userId }, 'DAILY_COMPETITION_SERVICE');
    
    try {
      // Verificar se já está participando
      const { data: existing } = await supabase
        .from('daily_participations')
        .select('id')
        .eq('competition_id', competitionId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        logger.warn('Usuário já participa da competição diária', { competitionId, userId }, 'DAILY_COMPETITION_SERVICE');
        return false;
      }

      // Adicionar participação
      const { error } = await supabase
        .from('daily_participations')
        .insert({
          competition_id: competitionId,
          user_id: userId,
          score: 0,
          words_found: [],
        });

      if (error) {
        logger.error('Erro ao participar de competição diária', { error: error.message }, 'DAILY_COMPETITION_SERVICE');
        throw error;
      }

      // Atualizar contador
      await this.updateParticipantCount(competitionId);

      logger.info('Participação em competição diária realizada com sucesso', { competitionId, userId }, 'DAILY_COMPETITION_SERVICE');
      return true;
    } catch (error: any) {
      logger.error('Erro ao participar de competição diária', { error: error.message }, 'DAILY_COMPETITION_SERVICE');
      throw error;
    }
  }

  async submitScore(competitionId: string, userId: string, score: number, wordsFound: string[]): Promise<void> {
    logger.info('Enviando pontuação da competição diária', { 
      competitionId, 
      userId, 
      score, 
      wordsCount: wordsFound.length 
    }, 'DAILY_COMPETITION_SERVICE');
    
    const { error } = await supabase
      .from('daily_participations')
      .update({
        score,
        words_found: wordsFound,
        completed_at: new Date().toISOString(),
      })
      .eq('competition_id', competitionId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Erro ao enviar pontuação da competição diária', { error: error.message }, 'DAILY_COMPETITION_SERVICE');
      throw error;
    }

    logger.info('Pontuação da competição diária enviada com sucesso', { competitionId, userId, score }, 'DAILY_COMPETITION_SERVICE');
  }

  async getDailyRanking(competitionId: string): Promise<DailyParticipation[]> {
    logger.debug('Buscando ranking da competição diária', { competitionId }, 'DAILY_COMPETITION_SERVICE');
    
    const { data, error } = await supabase
      .from('daily_participations')
      .select(`
        *,
        profiles!inner(username, avatar_url)
      `)
      .eq('competition_id', competitionId)
      .order('score', { ascending: false })
      .limit(100);

    if (error) {
      logger.error('Erro ao buscar ranking da competição diária', { error: error.message }, 'DAILY_COMPETITION_SERVICE');
      throw error;
    }

    logger.info('Ranking da competição diária carregado', { 
      competitionId, 
      participants: data?.length || 0 
    }, 'DAILY_COMPETITION_SERVICE');
    
    return data || [];
  }

  async getUserDailyParticipation(competitionId: string, userId: string): Promise<DailyParticipation | null> {
    logger.debug('Buscando participação diária do usuário', { competitionId, userId }, 'DAILY_COMPETITION_SERVICE');
    
    const { data, error } = await supabase
      .from('daily_participations')
      .select('*')
      .eq('competition_id', competitionId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Erro ao buscar participação diária do usuário', { error: error.message }, 'DAILY_COMPETITION_SERVICE');
      throw error;
    }

    if (data) {
      logger.debug('Participação diária do usuário encontrada', { competitionId, userId }, 'DAILY_COMPETITION_SERVICE');
    } else {
      logger.debug('Usuário não participa da competição diária', { competitionId, userId }, 'DAILY_COMPETITION_SERVICE');
    }

    return data;
  }

  private async updateParticipantCount(competitionId: string): Promise<void> {
    logger.debug('Atualizando contador de participantes da competição diária', { competitionId }, 'DAILY_COMPETITION_SERVICE');
    
    const { count } = await supabase
      .from('daily_participations')
      .select('*', { count: 'exact', head: true })
      .eq('competition_id', competitionId);

    const { error } = await supabase
      .from('daily_competitions')
      .update({ total_participants: count || 0 })
      .eq('id', competitionId);

    if (error) {
      logger.error('Erro ao atualizar contador de participantes da competição diária', { error: error.message }, 'DAILY_COMPETITION_SERVICE');
    } else {
      logger.debug('Contador de participantes da competição diária atualizado', { competitionId, count }, 'DAILY_COMPETITION_SERVICE');
    }
  }

  async finalizeDailyCompetition(competitionId: string): Promise<void> {
    logger.info('Finalizando competição diária', { competitionId }, 'DAILY_COMPETITION_SERVICE');
    
    try {
      // Atualizar posições do ranking
      await this.updateDailyRankingPositions(competitionId);
      
      // Marcar como finalizada
      const { error } = await supabase
        .from('daily_competitions')
        .update({ status: 'completed' })
        .eq('id', competitionId);

      if (error) {
        logger.error('Erro ao finalizar competição diária', { error: error.message }, 'DAILY_COMPETITION_SERVICE');
        throw error;
      }

      logger.info('Competição diária finalizada com sucesso', { competitionId }, 'DAILY_COMPETITION_SERVICE');
    } catch (error: any) {
      logger.error('Erro ao finalizar competição diária', { error: error.message }, 'DAILY_COMPETITION_SERVICE');
      throw error;
    }
  }

  private async updateDailyRankingPositions(competitionId: string): Promise<void> {
    logger.debug('Atualizando posições do ranking diário', { competitionId }, 'DAILY_COMPETITION_SERVICE');
    
    const { data: participants, error } = await supabase
      .from('daily_participations')
      .select('id, score')
      .eq('competition_id', competitionId)
      .order('score', { ascending: false });

    if (error) {
      logger.error('Erro ao buscar participantes para ranking diário', { error: error.message }, 'DAILY_COMPETITION_SERVICE');
      throw error;
    }

    if (!participants || participants.length === 0) {
      logger.warn('Nenhum participante encontrado para ranking diário', { competitionId }, 'DAILY_COMPETITION_SERVICE');
      return;
    }

    // Atualizar posições
    for (let i = 0; i < participants.length; i++) {
      const { error: updateError } = await supabase
        .from('daily_participations')
        .update({ position: i + 1 })
        .eq('id', participants[i].id);

      if (updateError) {
        logger.error('Erro ao atualizar posição no ranking diário', { error: updateError.message }, 'DAILY_COMPETITION_SERVICE');
      }
    }

    logger.info('Posições do ranking diário atualizadas', { 
      competitionId, 
      participants: participants.length 
    }, 'DAILY_COMPETITION_SERVICE');
  }
}

export const dailyCompetitionService = new DailyCompetitionService();
