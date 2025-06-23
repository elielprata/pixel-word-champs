
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { Competition, CompetitionParticipation } from '@/types';

class CompetitionService {
  async getActiveCompetitions(): Promise<Competition[]> {
    logger.debug('Buscando competições ativas', undefined, 'COMPETITION_SERVICE');
    
    const { data, error } = await supabase
      .from('custom_competitions')
      .select('*')
      .eq('status', 'active')
      .order('start_date', { ascending: true });

    if (error) {
      logger.error('Erro ao buscar competições ativas', { error: error.message }, 'COMPETITION_SERVICE');
      throw error;
    }

    // Mapear dados para interface Competition
    const competitions: Competition[] = (data || []).map(item => ({
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      start_date: item.start_date,
      end_date: item.end_date,
      status: item.status as 'pending' | 'active' | 'completed' | 'scheduled',
      type: item.competition_type === 'challenge' ? 'daily' : item.competition_type === 'tournament' ? 'weekly' : 'daily',
      competition_type: item.competition_type,
      prize_pool: item.prize_pool || 0,
      max_participants: item.max_participants,
      total_participants: 0, // Calcular se necessário
      theme: item.theme,
      rules: item.entry_requirements,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));

    logger.info('Competições ativas carregadas', { count: competitions.length }, 'COMPETITION_SERVICE');
    return competitions;
  }

  async getCompetitionById(id: string): Promise<Competition | null> {
    logger.debug('Buscando competição por ID', { id }, 'COMPETITION_SERVICE');
    
    const { data, error } = await supabase
      .from('custom_competitions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Erro ao buscar competição por ID', { error: error.message, id }, 'COMPETITION_SERVICE');
      return null;
    }

    if (!data) return null;

    // Mapear dados para interface Competition
    const competition: Competition = {
      id: data.id,
      title: data.title || '',
      description: data.description || '',
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status as 'pending' | 'active' | 'completed' | 'scheduled',
      type: data.competition_type === 'challenge' ? 'daily' : data.competition_type === 'tournament' ? 'weekly' : 'daily',
      competition_type: data.competition_type,
      prize_pool: data.prize_pool || 0,
      max_participants: data.max_participants,
      total_participants: 0, // Calcular se necessário
      theme: data.theme,
      rules: data.entry_requirements,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    logger.info('Competição encontrada', { id }, 'COMPETITION_SERVICE');
    return competition;
  }

  async joinCompetition(competitionId: string, userId: string): Promise<boolean> {
    logger.info('Participando de competição', { competitionId, userId }, 'COMPETITION_SERVICE');
    
    try {
      // Verificar se já está participando
      const { data: existing } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('competition_id', competitionId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        logger.warn('Usuário já participa da competição', { competitionId, userId }, 'COMPETITION_SERVICE');
        return false;
      }

      // Adicionar participação
      const { error } = await supabase
        .from('competition_participations')
        .insert({
          competition_id: competitionId,
          user_id: userId,
          user_score: 0,
        });

      if (error) {
        logger.error('Erro ao participar de competição', { error: error.message }, 'COMPETITION_SERVICE');
        throw error;
      }

      // Atualizar contador de participantes
      await this.updateParticipantCount(competitionId);
      
      logger.info('Participação em competição realizada com sucesso', { competitionId, userId }, 'COMPETITION_SERVICE');
      return true;
    } catch (error: any) {
      logger.error('Erro ao participar de competição', { error: error.message }, 'COMPETITION_SERVICE');
      throw error;
    }
  }

  async updateScore(competitionId: string, userId: string, score: number): Promise<void> {
    logger.info('Atualizando pontuação na competição', { competitionId, userId, score }, 'COMPETITION_SERVICE');
    
    const { error } = await supabase
      .from('competition_participations')
      .update({ 
        user_score: score,
        created_at: new Date().toISOString()
      })
      .eq('competition_id', competitionId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Erro ao atualizar pontuação', { error: error.message }, 'COMPETITION_SERVICE');
      throw error;
    }

    logger.info('Pontuação atualizada com sucesso', { competitionId, userId, score }, 'COMPETITION_SERVICE');
  }

  async getCompetitionRanking(competitionId: string): Promise<CompetitionParticipation[]> {
    logger.debug('Buscando ranking da competição', { competitionId }, 'COMPETITION_SERVICE');
    
    const { data, error } = await supabase
      .from('competition_participations')
      .select(`
        *,
        profiles!inner(username, avatar_url)
      `)
      .eq('competition_id', competitionId)
      .order('user_score', { ascending: false })
      .limit(100);

    if (error) {
      logger.error('Erro ao buscar ranking da competição', { error: error.message }, 'COMPETITION_SERVICE');
      throw error;
    }

    // Mapear dados para interface CompetitionParticipation
    const participations: CompetitionParticipation[] = (data || []).map(item => ({
      id: item.id,
      competition_id: item.competition_id,
      user_id: item.user_id,
      score: item.user_score || 0,
      user_score: item.user_score,
      position: item.user_position,
      user_position: item.user_position,
      joined_at: item.created_at,
      created_at: item.created_at,
      completed_at: undefined,
      payment_status: item.payment_status,
      prize: item.prize,
      payment_date: item.payment_date
    }));

    logger.info('Ranking da competição carregado', { 
      competitionId, 
      participants: participations.length 
    }, 'COMPETITION_SERVICE');
    
    return participations;
  }

  async getUserParticipation(competitionId: string, userId: string): Promise<CompetitionParticipation | null> {
    logger.debug('Buscando participação do usuário', { competitionId, userId }, 'COMPETITION_SERVICE');
    
    const { data, error } = await supabase
      .from('competition_participations')
      .select('*')
      .eq('competition_id', competitionId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Erro ao buscar participação do usuário', { error: error.message }, 'COMPETITION_SERVICE');
      throw error;
    }

    if (!data) {
      logger.debug('Usuário não participa da competição', { competitionId, userId }, 'COMPETITION_SERVICE');
      return null;
    }

    // Mapear dados para interface CompetitionParticipation
    const participation: CompetitionParticipation = {
      id: data.id,
      competition_id: data.competition_id,
      user_id: data.user_id,
      score: data.user_score || 0,
      user_score: data.user_score,
      position: data.user_position,
      user_position: data.user_position,
      joined_at: data.created_at,
      created_at: data.created_at,
      completed_at: undefined,
      payment_status: data.payment_status,
      prize: data.prize,
      payment_date: data.payment_date
    };

    logger.debug('Participação do usuário encontrada', { competitionId, userId }, 'COMPETITION_SERVICE');
    return participation;
  }

  private async updateParticipantCount(competitionId: string): Promise<void> {
    logger.debug('Atualizando contador de participantes', { competitionId }, 'COMPETITION_SERVICE');
    
    const { count } = await supabase
      .from('competition_participations')
      .select('*', { count: 'exact', head: true })
      .eq('competition_id', competitionId);

    const { error } = await supabase
      .from('custom_competitions')
      .update({ max_participants: count || 0 })
      .eq('id', competitionId);

    if (error) {
      logger.error('Erro ao atualizar contador de participantes', { error: error.message }, 'COMPETITION_SERVICE');
    } else {
      logger.debug('Contador de participantes atualizado', { competitionId, count }, 'COMPETITION_SERVICE');
    }
  }

  async finalizeCompetition(competitionId: string): Promise<void> {
    logger.info('Finalizando competição', { competitionId }, 'COMPETITION_SERVICE');
    
    try {
      // Atualizar posições do ranking
      await this.updateRankingPositions(competitionId);
      
      // Marcar competição como finalizada
      const { error } = await supabase
        .from('custom_competitions')
        .update({ status: 'completed' })
        .eq('id', competitionId);

      if (error) {
        logger.error('Erro ao finalizar competição', { error: error.message }, 'COMPETITION_SERVICE');
        throw error;
      }

      logger.info('Competição finalizada com sucesso', { competitionId }, 'COMPETITION_SERVICE');
    } catch (error: any) {
      logger.error('Erro ao finalizar competição', { error: error.message }, 'COMPETITION_SERVICE');
      throw error;
    }
  }

  private async updateRankingPositions(competitionId: string): Promise<void> {
    logger.debug('Atualizando posições do ranking', { competitionId }, 'COMPETITION_SERVICE');
    
    const { data: participants, error } = await supabase
      .from('competition_participations')
      .select('id, user_score')
      .eq('competition_id', competitionId)
      .order('user_score', { ascending: false });

    if (error) {
      logger.error('Erro ao buscar participantes para ranking', { error: error.message }, 'COMPETITION_SERVICE');
      throw error;
    }

    if (!participants || participants.length === 0) {
      logger.warn('Nenhum participante encontrado para atualizar ranking', { competitionId }, 'COMPETITION_SERVICE');
      return;
    }

    // Atualizar posições
    const updates = participants.map((participant, index) => ({
      id: participant.id,
      user_position: index + 1,
    }));

    for (const update of updates) {
      await supabase
        .from('competition_participations')
        .update({ user_position: update.user_position })
        .eq('id', update.id);
    }

    logger.info('Posições do ranking atualizadas', { 
      competitionId, 
      participants: participants.length 
    }, 'COMPETITION_SERVICE');
  }
}

export const competitionService = new CompetitionService();
