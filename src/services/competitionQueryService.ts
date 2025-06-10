
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { getBrasiliaTime, convertToBrasiliaTime } from '@/utils/brasiliaTime';

export class CompetitionQueryService {
  async getActiveDailyCompetitions(): Promise<ApiResponse<any[]>> {
    try {
      console.log('🔍 Buscando competições diárias ativas no banco...');
      
      const brasiliaNow = getBrasiliaTime();
      console.log('📅 Data atual de Brasília:', brasiliaNow.toISOString());

      // Buscar todas as competições do tipo 'challenge' que estão ativas
      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar competições:', error);
        throw error;
      }

      console.log('📊 Resposta bruta do banco:', { data: competitions, error });
      console.log('📊 Total de competições challenge ativas encontradas:', competitions?.length || 0);

      if (!competitions || competitions.length === 0) {
        console.log('📅 Nenhuma competição challenge ativa encontrada no banco');
        return createSuccessResponse([]);
      }

      // Log das competições encontradas
      competitions.forEach((comp, index) => {
        console.log(`📋 Competição ${index + 1}:`, {
          id: comp.id,
          title: comp.title,
          type: comp.competition_type,
          status: comp.status,
          start_date: comp.start_date,
          end_date: comp.end_date
        });
      });

      // Filtrar competições que estão ativas no horário de Brasília
      const activeCompetitions = competitions.filter(comp => {
        const startDate = new Date(comp.start_date);
        const endDate = new Date(comp.end_date);
        
        // Converter para horário de Brasília
        const startBrasilia = convertToBrasiliaTime(startDate);
        const endBrasilia = convertToBrasiliaTime(endDate);
        
        console.log(`🔍 Verificando "${comp.title}":`);
        console.log('  📅 Início UTC:', startDate.toISOString());
        console.log('  📅 Fim UTC:', endDate.toISOString());
        console.log('  📅 Início Brasília:', startBrasilia.toISOString());
        console.log('  📅 Fim Brasília:', endBrasilia.toISOString());
        console.log('  🕐 Agora Brasília:', brasiliaNow.toISOString());
        
        const isActive = brasiliaNow >= startBrasilia && brasiliaNow <= endBrasilia;
        console.log('  ✅ Ativo:', isActive);
        
        return isActive;
      });

      console.log('✅ Competições ativas filtradas por horário de Brasília:', activeCompetitions.length);

      return createSuccessResponse(activeCompetitions);
    } catch (error) {
      console.error('❌ Erro no serviço de consulta de competições:', error);
      return createErrorResponse(handleServiceError(error, 'COMPETITION_QUERY_DAILY'));
    }
  }

  async getDailyCompetitionRanking(competitionId: string): Promise<ApiResponse<any[]>> {
    try {
      console.log('🏆 Buscando ranking da competição:', competitionId);

      const { data: participations, error } = await supabase
        .from('competition_participations')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('competition_id', competitionId)
        .order('user_score', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar ranking:', error);
        throw error;
      }

      console.log('📊 Participações encontradas:', participations?.length || 0);

      const rankingData = participations?.map((participation, index) => ({
        position: index + 1,
        user_id: participation.user_id,
        username: participation.profiles?.username || 'Usuário',
        avatar_url: participation.profiles?.avatar_url,
        score: participation.user_score || 0,
        prize: participation.prize || 0,
        payment_status: participation.payment_status || 'not_eligible'
      })) || [];

      return createSuccessResponse(rankingData);
    } catch (error) {
      console.error('❌ Erro ao buscar ranking da competição:', error);
      return createErrorResponse(handleServiceError(error, 'COMPETITION_RANKING_QUERY'));
    }
  }
}

export const competitionQueryService = new CompetitionQueryService();
