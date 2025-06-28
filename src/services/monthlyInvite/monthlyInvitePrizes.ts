
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

export interface MonthlyInvitePrize {
  id: string;
  competition_id: string;
  position: number;
  prize_amount: number;
  active: boolean;
  description?: string;
  created_at: string;
}

export class MonthlyInvitePrizesService {
  async getMonthlyPrizes(competitionId?: string) {
    try {
      logger.debug('Buscando prêmios da competição mensal', { competitionId }, 'MONTHLY_PRIZES_SERVICE');

      if (!competitionId) {
        return createSuccessResponse([]);
      }

      const { data: prizes, error } = await supabase
        .from('monthly_invite_prizes')
        .select('*')
        .eq('competition_id', competitionId)
        .order('position', { ascending: true });

      if (error) {
        logger.error('Erro ao buscar prêmios mensais', { error }, 'MONTHLY_PRIZES_SERVICE');
        return createErrorResponse(`Erro ao buscar prêmios: ${error.message}`);
      }

      logger.info('Prêmios mensais carregados', { count: prizes?.length || 0 }, 'MONTHLY_PRIZES_SERVICE');
      return createSuccessResponse(prizes || []);
    } catch (error) {
      logger.error('Erro ao buscar prêmios mensais', { error }, 'MONTHLY_PRIZES_SERVICE');
      return createErrorResponse(`Erro ao buscar prêmios: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async updatePrize(prizeId: string, updates: Partial<MonthlyInvitePrize>) {
    try {
      logger.debug('Atualizando prêmio', { prizeId, updates }, 'MONTHLY_PRIZES_SERVICE');

      const { data, error } = await supabase
        .from('monthly_invite_prizes')
        .update(updates)
        .eq('id', prizeId)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar prêmio', { error }, 'MONTHLY_PRIZES_SERVICE');
        return createErrorResponse(`Erro ao atualizar prêmio: ${error.message}`);
      }

      logger.info('Prêmio atualizado com sucesso', { prizeId }, 'MONTHLY_PRIZES_SERVICE');
      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro ao atualizar prêmio', { error }, 'MONTHLY_PRIZES_SERVICE');
      return createErrorResponse(`Erro ao atualizar prêmio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async createPrize(competitionId: string, position: number, prizeAmount: number, description?: string) {
    try {
      logger.debug('Criando novo prêmio', { competitionId, position, prizeAmount }, 'MONTHLY_PRIZES_SERVICE');

      const { data, error } = await supabase
        .from('monthly_invite_prizes')
        .insert({
          competition_id: competitionId,
          position,
          prize_amount: prizeAmount,
          description,
          active: true
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar prêmio', { error }, 'MONTHLY_PRIZES_SERVICE');
        return createErrorResponse(`Erro ao criar prêmio: ${error.message}`);
      }

      logger.info('Prêmio criado com sucesso', { prizeId: data.id }, 'MONTHLY_PRIZES_SERVICE');
      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro ao criar prêmio', { error }, 'MONTHLY_PRIZES_SERVICE');
      return createErrorResponse(`Erro ao criar prêmio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async deletePrize(prizeId: string) {
    try {
      logger.debug('Excluindo prêmio', { prizeId }, 'MONTHLY_PRIZES_SERVICE');

      const { error } = await supabase
        .from('monthly_invite_prizes')
        .delete()
        .eq('id', prizeId);

      if (error) {
        logger.error('Erro ao excluir prêmio', { error }, 'MONTHLY_PRIZES_SERVICE');
        return createErrorResponse(`Erro ao excluir prêmio: ${error.message}`);
      }

      logger.info('Prêmio excluído com sucesso', { prizeId }, 'MONTHLY_PRIZES_SERVICE');
      return createSuccessResponse({ success: true });
    } catch (error) {
      logger.error('Erro ao excluir prêmio', { error }, 'MONTHLY_PRIZES_SERVICE');
      return createErrorResponse(`Erro ao excluir prêmio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async togglePrizeStatus(prizeId: string, active: boolean) {
    try {
      logger.debug('Alterando status do prêmio', { prizeId, active }, 'MONTHLY_PRIZES_SERVICE');

      const { data, error } = await supabase
        .from('monthly_invite_prizes')
        .update({ active })
        .eq('id', prizeId)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao alterar status do prêmio', { error }, 'MONTHLY_PRIZES_SERVICE');
        return createErrorResponse(`Erro ao alterar status: ${error.message}`);
      }

      logger.info('Status do prêmio alterado', { prizeId, active }, 'MONTHLY_PRIZES_SERVICE');
      return createSuccessResponse(data);
    } catch (error) {
      logger.error('Erro ao alterar status do prêmio', { error }, 'MONTHLY_PRIZES_SERVICE');
      return createErrorResponse(`Erro ao alterar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}

export const monthlyInvitePrizesService = new MonthlyInvitePrizesService();
