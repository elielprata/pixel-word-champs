
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface Competition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'completed';
  type: 'daily' | 'weekly' | 'custom';
  prize_pool: number;
  max_participants?: number;
  total_participants: number;
  theme?: string;
  rules?: any;
  created_at: string;
  updated_at: string;
}

export interface CompetitionParticipation {
  id: string;
  competition_id: string;
  user_id: string;
  score: number;
  position?: number;
  joined_at: string;
  completed_at?: string;
}

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

    logger.info('Competições ativas carregadas', { count: data?.length || 0 }, 'COMPETITION_SERVICE');
    return data || [];
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

    logger.info('Competição encontrada', { id }, 'COMPETITION_SERVICE');
    return data;
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
          score: 0,
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
        score,
        completed_at: new Date().toISOString()
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
      .order('score', { ascending: false })
      .limit(100);

    if (error) {
      logger.error('Erro ao buscar ranking da competição', { error: error.message }, 'COMPETITION_SERVICE');
      throw error;
    }

    logger.info('Ranking da competição carregado', { 
      competitionId, 
      participants: data?.length || 0 
    }, 'COMPETITION_SERVICE');
    
    return data || [];
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

    if (data) {
      logger.debug('Participação do usuário encontrada', { competitionId, userId }, 'COMPETITION_SERVICE');
    } else {
      logger.debug('Usuário não participa da competição', { competitionId, userId }, 'COMPETITION_SERVICE');
    }

    return data;
  }

  private async updateParticipantCount(competitionId: string): Promise<void> {
    logger.debug('Atualizando contador de participantes', { competitionId }, 'COMPETITION_SERVICE');
    
    const { count } = await supabase
      .from('competition_participations')
      .select('*', { count: 'exact', head: true })
      .eq('competition_id', competitionId);

    const { error } = await supabase
      .from('custom_competitions')
      .update({ total_participants: count || 0 })
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
      .select('id, score')
      .eq('competition_id', competitionId)
      .order('score', { ascending: false });

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
      position: index + 1,
    }));

    for (const update of updates) {
      await supabase
        .from('competition_participations')
        .update({ position: update.position })
        .eq('id', update.id);
    }

    logger.info('Posições do ranking atualizadas', { 
      competitionId, 
      participants: participants.length 
    }, 'COMPETITION_SERVICE');
  }
}

export const competitionService = new CompetitionService();
