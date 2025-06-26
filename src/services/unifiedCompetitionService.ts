
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

export interface UnifiedCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  competition_type: string;
  theme: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
}

export interface CreateCompetitionData {
  title: string;
  description: string;
  type: 'daily';
  startDate: string;
  endDate: string;
  duration: number;
  maxParticipants: number;
}

class UnifiedCompetitionService {
  async getAllCompetitions(): Promise<ApiResponse<UnifiedCompetition[]>> {
    try {
      logger.info('🔍 Buscando todas as competições', undefined, 'UNIFIED_COMPETITIONS');

      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('❌ Erro ao buscar competições:', { error }, 'UNIFIED_COMPETITIONS');
        throw error;
      }

      logger.info('✅ Competições carregadas', { 
        count: competitions?.length || 0,
        timestamp: getCurrentBrasiliaTime()
      }, 'UNIFIED_COMPETITIONS');

      // Mapear para formato unificado - CONFIAR NO STATUS DO BANCO
      const unifiedCompetitions: UnifiedCompetition[] = (competitions || []).map(comp => ({
        id: comp.id,
        title: comp.title,
        description: comp.description || '',
        start_date: comp.start_date,
        end_date: comp.end_date,
        status: comp.status, // USAR APENAS STATUS DO BANCO
        competition_type: comp.competition_type,
        theme: comp.theme || '',
        prize_pool: Number(comp.prize_pool) || 0,
        max_participants: comp.max_participants || 0,
        total_participants: 0 // Pode ser calculado separadamente se necessário
      }));

      return createSuccessResponse(unifiedCompetitions);
    } catch (error) {
      logger.error('❌ Erro no serviço unificado de competições:', { error }, 'UNIFIED_COMPETITIONS');
      return createErrorResponse(handleServiceError(error, 'GET_UNIFIED_COMPETITIONS'));
    }
  }

  // Alias para compatibilidade
  async getCompetitions(): Promise<ApiResponse<UnifiedCompetition[]>> {
    return this.getAllCompetitions();
  }

  async getCompetitionsByType(type: string): Promise<ApiResponse<UnifiedCompetition[]>> {
    try {
      logger.info('🔍 Buscando competições por tipo', { type }, 'UNIFIED_COMPETITIONS');

      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', type)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('❌ Erro ao buscar competições por tipo:', { error, type }, 'UNIFIED_COMPETITIONS');
        throw error;
      }

      // Mapear para formato unificado - CONFIAR NO STATUS DO BANCO
      const unifiedCompetitions: UnifiedCompetition[] = (competitions || []).map(comp => ({
        id: comp.id,
        title: comp.title,
        description: comp.description || '',
        start_date: comp.start_date,
        end_date: comp.end_date,
        status: comp.status, // USAR APENAS STATUS DO BANCO
        competition_type: comp.competition_type,
        theme: comp.theme || '',
        prize_pool: Number(comp.prize_pool) || 0,
        max_participants: comp.max_participants || 0,
        total_participants: 0
      }));

      logger.info('✅ Competições por tipo carregadas', { 
        type, 
        count: unifiedCompetitions.length,
        timestamp: getCurrentBrasiliaTime()
      }, 'UNIFIED_COMPETITIONS');

      return createSuccessResponse(unifiedCompetitions);
    } catch (error) {
      logger.error('❌ Erro ao buscar competições por tipo:', { error, type }, 'UNIFIED_COMPETITIONS');
      return createErrorResponse(handleServiceError(error, 'GET_COMPETITIONS_BY_TYPE'));
    }
  }

  async createCompetition(data: CreateCompetitionData): Promise<ApiResponse<UnifiedCompetition>> {
    try {
      logger.info('🏗️ Criando nova competição', { 
        title: data.title, 
        type: data.type 
      }, 'UNIFIED_COMPETITIONS');

      // Converter datas para UTC para armazenamento
      const startDateUTC = new Date(data.startDate).toISOString();
      const endDateUTC = new Date(data.endDate).toISOString();

      const competitionData = {
        title: data.title,
        description: data.description,
        competition_type: 'challenge', // Sempre challenge para competições diárias
        start_date: startDateUTC,
        end_date: endDateUTC,
        status: 'scheduled', // Status inicial sempre scheduled
        prize_pool: 0, // Competições diárias não têm prêmio
        max_participants: data.maxParticipants || 0,
        theme: 'daily',
        rules: {
          duration_hours: data.duration,
          type: 'daily_challenge'
        }
      };

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .insert(competitionData)
        .select()
        .single();

      if (error) {
        logger.error('❌ Erro ao criar competição:', { error }, 'UNIFIED_COMPETITIONS');
        throw error;
      }

      logger.info('✅ Competição criada com sucesso', { 
        id: competition.id,
        title: competition.title,
        timestamp: getCurrentBrasiliaTime()
      }, 'UNIFIED_COMPETITIONS');

      const unifiedCompetition: UnifiedCompetition = {
        id: competition.id,
        title: competition.title,
        description: competition.description || '',
        start_date: competition.start_date,
        end_date: competition.end_date,
        status: competition.status,
        competition_type: competition.competition_type,
        theme: competition.theme || '',
        prize_pool: Number(competition.prize_pool) || 0,
        max_participants: competition.max_participants || 0,
        total_participants: 0
      };

      return createSuccessResponse(unifiedCompetition);
    } catch (error) {
      logger.error('❌ Erro ao criar competição:', { error }, 'UNIFIED_COMPETITIONS');
      return createErrorResponse(handleServiceError(error, 'CREATE_COMPETITION'));
    }
  }

  async deleteCompetition(competitionId: string): Promise<ApiResponse<void>> {
    try {
      logger.info('🗑️ Deletando competição', { competitionId }, 'UNIFIED_COMPETITIONS');

      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', competitionId);

      if (error) {
        logger.error('❌ Erro ao deletar competição:', { error, competitionId }, 'UNIFIED_COMPETITIONS');
        throw error;
      }

      logger.info('✅ Competição deletada com sucesso', { 
        competitionId,
        timestamp: getCurrentBrasiliaTime()
      }, 'UNIFIED_COMPETITIONS');

      return createSuccessResponse(undefined);
    } catch (error) {
      logger.error('❌ Erro no serviço de deleção:', { error, competitionId }, 'UNIFIED_COMPETITIONS');
      return createErrorResponse(handleServiceError(error, 'DELETE_COMPETITION'));
    }
  }
}

export const unifiedCompetitionService = new UnifiedCompetitionService();
