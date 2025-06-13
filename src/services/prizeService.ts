
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface Prize {
  id: string;
  competition_id: string;
  position: number;
  amount: number;
  description?: string;
  created_at: string;
}

export interface PrizeWinner {
  id: string;
  prize_id: string;
  user_id: string;
  awarded_at: string;
  payment_status: 'pending' | 'completed' | 'failed';
}

class PrizeService {
  async createPrize(competitionId: string, position: number, amount: number, description?: string): Promise<Prize | null> {
    try {
      logger.info('Criando novo prêmio', { 
        competitionId, 
        position, 
        amount,
        hasDescription: !!description 
      }, 'PRIZE_SERVICE');

      const prizeData = {
        competition_id: competitionId,
        position,
        amount,
        description: description || null
      };

      const { data: prize, error } = await supabase
        .from('prizes')
        .insert(prizeData)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar prêmio no banco de dados', { error }, 'PRIZE_SERVICE');
        throw error;
      }

      logger.info('Prêmio criado com sucesso', { 
        prizeId: prize.id,
        competitionId,
        position,
        amount 
      }, 'PRIZE_SERVICE');

      return prize;
    } catch (error) {
      logger.error('Erro crítico ao criar prêmio', { error }, 'PRIZE_SERVICE');
      return null;
    }
  }

  async getCompetitionPrizes(competitionId: string): Promise<Prize[]> {
    try {
      logger.debug('Buscando prêmios da competição', { competitionId }, 'PRIZE_SERVICE');

      const { data: prizes, error } = await supabase
        .from('prizes')
        .select('*')
        .eq('competition_id', competitionId)
        .order('position', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar prêmios no banco de dados', { 
          competitionId, 
          error 
        }, 'PRIZE_SERVICE');
        throw error;
      }

      logger.debug('Prêmios carregados com sucesso', { 
        competitionId, 
        count: prizes?.length || 0 
      }, 'PRIZE_SERVICE');

      return prizes || [];
    } catch (error) {
      logger.error('Erro crítico ao buscar prêmios', { 
        competitionId, 
        error 
      }, 'PRIZE_SERVICE');
      return [];
    }
  }

  async awardPrize(prizeId: string, userId: string): Promise<PrizeWinner | null> {
    try {
      logger.info('Concedendo prêmio ao usuário', { 
        prizeId, 
        userId 
      }, 'PRIZE_SERVICE');

      const winnerData = {
        prize_id: prizeId,
        user_id: userId,
        awarded_at: new Date().toISOString(),
        payment_status: 'pending' as const
      };

      const { data: winner, error } = await supabase
        .from('prize_winners')
        .insert(winnerData)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao conceder prêmio no banco de dados', { 
          prizeId, 
          userId, 
          error 
        }, 'PRIZE_SERVICE');
        throw error;
      }

      logger.info('Prêmio concedido com sucesso', { 
        winnerId: winner.id,
        prizeId,
        userId 
      }, 'PRIZE_SERVICE');

      return winner;
    } catch (error) {
      logger.error('Erro crítico ao conceder prêmio', { 
        prizeId, 
        userId, 
        error 
      }, 'PRIZE_SERVICE');
      return null;
    }
  }

  async getUserPrizes(userId: string): Promise<PrizeWinner[]> {
    try {
      logger.debug('Buscando prêmios do usuário', { userId }, 'PRIZE_SERVICE');

      const { data: winners, error } = await supabase
        .from('prize_winners')
        .select(`
          *,
          prizes (
            amount,
            description,
            position,
            competition_id
          )
        `)
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar prêmios do usuário no banco de dados', { 
          userId, 
          error 
        }, 'PRIZE_SERVICE');
        throw error;
      }

      logger.debug('Prêmios do usuário carregados com sucesso', { 
        userId, 
        count: winners?.length || 0 
      }, 'PRIZE_SERVICE');

      return winners || [];
    } catch (error) {
      logger.error('Erro crítico ao buscar prêmios do usuário', { 
        userId, 
        error 
      }, 'PRIZE_SERVICE');
      return [];
    }
  }

  async updatePrizePaymentStatus(winnerId: string, status: 'pending' | 'completed' | 'failed'): Promise<boolean> {
    try {
      logger.info('Atualizando status de pagamento do prêmio', { 
        winnerId, 
        status 
      }, 'PRIZE_SERVICE');

      const { error } = await supabase
        .from('prize_winners')
        .update({ payment_status: status })
        .eq('id', winnerId);

      if (error) {
        logger.error('Erro ao atualizar status de pagamento no banco de dados', { 
          winnerId, 
          status, 
          error 
        }, 'PRIZE_SERVICE');
        throw error;
      }

      logger.info('Status de pagamento do prêmio atualizado com sucesso', { 
        winnerId, 
        status 
      }, 'PRIZE_SERVICE');

      return true;
    } catch (error) {
      logger.error('Erro crítico ao atualizar status de pagamento', { 
        winnerId, 
        status, 
        error 
      }, 'PRIZE_SERVICE');
      return false;
    }
  }
}

export const prizeService = new PrizeService();
