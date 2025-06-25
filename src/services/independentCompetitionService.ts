
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';
import { createBrasiliaTimestamp } from '@/utils/brasiliaTimeUnified';

interface IndependentCompetitionData {
  title: string;
  description: string;
  theme: string;
  startDate: string;
  maxParticipants: number;
}

interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class IndependentCompetitionService {
  async createIndependentCompetition(formData: IndependentCompetitionData): Promise<ServiceResponse> {
    try {
      secureLogger.info('Criando competição diária independente (BRASÍLIA)', { 
        title: formData.title, 
        theme: formData.theme 
      }, 'INDEPENDENT_COMPETITION_SERVICE');

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      // Preparar dados da competição independente em Brasília
      const startDateBrasilia = createBrasiliaTimestamp(formData.startDate);
      const endDateBrasilia = createBrasiliaTimestamp(formData.startDate);

      const competitionData = {
        title: formData.title,
        description: formData.description || null,
        competition_type: 'challenge',
        start_date: startDateBrasilia,
        end_date: endDateBrasilia,
        max_participants: formData.maxParticipants,
        prize_pool: 0, // Competições diárias não têm prêmios diretos
        theme: formData.theme,
        // IMPORTANTE: Não definir weekly_tournament_id (deixar null)
        weekly_tournament_id: null,
        created_by: user.user.id,
        status: 'active'
      };

      secureLogger.debug('Dados da competição independente (BRASÍLIA)', { 
        competitionData 
      }, 'INDEPENDENT_COMPETITION_SERVICE');

      const { data, error } = await supabase
        .from('custom_competitions')
        .insert(competitionData)
        .select()
        .single();

      if (error) {
        secureLogger.error('Erro do Supabase ao criar competição independente', { error }, 'INDEPENDENT_COMPETITION_SERVICE');
        throw error;
      }

      secureLogger.info('Competição independente criada com sucesso (BRASÍLIA)', { 
        id: data.id,
        title: data.title,
        independentSystem: true
      }, 'INDEPENDENT_COMPETITION_SERVICE');

      return { success: true, data };
    } catch (error) {
      secureLogger.error('Erro ao criar competição independente', { error }, 'INDEPENDENT_COMPETITION_SERVICE');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  async getIndependentCompetitions(): Promise<ServiceResponse> {
    try {
      secureLogger.debug('Buscando competições independentes', undefined, 'INDEPENDENT_COMPETITION_SERVICE');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .is('weekly_tournament_id', null) // Filtrar apenas independentes
        .order('created_at', { ascending: false });

      if (error) throw error;

      secureLogger.debug('Competições independentes carregadas', { 
        count: data?.length || 0 
      }, 'INDEPENDENT_COMPETITION_SERVICE');
      
      return { success: true, data: data || [] };
    } catch (error) {
      secureLogger.error('Erro ao buscar competições independentes', { error }, 'INDEPENDENT_COMPETITION_SERVICE');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  async getLegacyLinkedCompetitions(): Promise<ServiceResponse> {
    try {
      secureLogger.debug('Buscando competições vinculadas legadas', undefined, 'INDEPENDENT_COMPETITION_SERVICE');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .not('weekly_tournament_id', 'is', null) // Filtrar apenas vinculadas
        .order('created_at', { ascending: false });

      if (error) throw error;

      secureLogger.debug('Competições vinculadas legadas carregadas', { 
        count: data?.length || 0 
      }, 'INDEPENDENT_COMPETITION_SERVICE');
      
      return { success: true, data: data || [] };
    } catch (error) {
      secureLogger.error('Erro ao buscar competições vinculadas legadas', { error }, 'INDEPENDENT_COMPETITION_SERVICE');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }
}

export const independentCompetitionService = new IndependentCompetitionService();
