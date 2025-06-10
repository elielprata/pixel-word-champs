
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { getBrasiliaTime } from '@/utils/brasiliaTime';
import { adjustCompetitionEndTime, isCompetitionActive, logCompetitionVerification } from '@/utils/competitionTimeUtils';

class DailyCompetitionService {
  async getActiveDailyCompetitions(): Promise<{ success: boolean; data: any[]; error?: string }> {
    try {
      console.log('🔍 Buscando competições diárias ativas no banco...');
      
      const brasiliaTime = getBrasiliaTime();
      console.log('🕐 Horário UTC:', new Date().toISOString());
      console.log('🇧🇷 Horário Brasília calculado:', brasiliaTime.toISOString());
      console.log('📅 Data atual de Brasília:', brasiliaTime.toISOString());

      // Buscar todas as competições do tipo challenge que estão ativas
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .eq('status', 'active');

      console.log('📊 Resposta bruta do banco:', { data, error });

      if (error) {
        console.error('❌ Erro na consulta:', error);
        throw error;
      }

      const competitions = data || [];
      console.log(`📊 Total de competições challenge ativas encontradas: ${competitions.length}`);

      // Log detalhado de cada competição
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

      // Filtrar competições por data - usando lógica mais flexível
      const now = new Date();
      const activeCompetitions = competitions.filter(comp => {
        const startDate = new Date(comp.start_date);
        const endDate = new Date(comp.end_date);
        
        // Ajustar data de fim para incluir competições que terminaram hoje
        const adjustedEndDate = adjustCompetitionEndTime(startDate);
        
        // Verificar se a competição está ativa (mais flexível com datas)
        const isActive = now >= startDate && now <= adjustedEndDate;
        
        logCompetitionVerification(comp, isActive, now);
        
        return isActive;
      });

      console.log(`✅ Competições ativas após filtro de data: ${activeCompetitions.length}`);

      if (activeCompetitions.length === 0) {
        console.log('📅 Nenhuma competição ativa encontrada no período atual');
        
        // Debug adicional - mostrar todas as competições encontradas
        console.log('🔍 Debug - Todas as competições challenge encontradas:');
        competitions.forEach(comp => {
          const startDate = new Date(comp.start_date);
          const endDate = new Date(comp.end_date);
          const hasStarted = now >= startDate;
          const hasNotEnded = now <= endDate;
          
          console.log(`- ${comp.title}:`);
          console.log(`  Início: ${startDate.toISOString()}`);
          console.log(`  Fim: ${endDate.toISOString()}`);
          console.log(`  Agora: ${now.toISOString()}`);
          console.log(`  Timestamps - Start: ${startDate.getTime()}, End: ${endDate.getTime()}, Current: ${now.getTime()}`);
          console.log(`  Começou: ${hasStarted}, Não terminou: ${hasNotEnded}`);
        });
      }

      // Mapear competições para o formato esperado
      const formattedCompetitions = activeCompetitions.map(comp => ({
        id: comp.id,
        title: comp.title,
        description: comp.description || '',
        theme: comp.theme || 'geral',
        start_date: comp.start_date,
        end_date: comp.end_date,
        status: comp.status,
        prize_pool: Number(comp.prize_pool) || 0,
        max_participants: comp.max_participants || 1000
      }));

      console.log(`✅ ${formattedCompetitions.length} competições diárias encontradas`);
      
      return createSuccessResponse(formattedCompetitions);
    } catch (error) {
      console.error('❌ Erro ao buscar competições diárias:', error);
      return createErrorResponse(handleServiceError(error, 'DAILY_COMPETITION_GET_ACTIVE'));
    }
  }

  async createDailyCompetition(competitionData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('🎯 Criando nova competição diária...');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .insert({
          title: competitionData.title,
          description: competitionData.description || '',
          competition_type: 'challenge',
          theme: competitionData.theme || 'geral',
          start_date: competitionData.start_date,
          end_date: competitionData.end_date,
          prize_pool: competitionData.prize_pool || 0,
          max_participants: competitionData.max_participants || 1000,
          status: 'active',
          created_by: competitionData.created_by
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar competição:', error);
        throw error;
      }

      console.log('✅ Competição diária criada com sucesso:', data.id);
      return createSuccessResponse(data);
    } catch (error) {
      console.error('❌ Erro ao criar competição diária:', error);
      return createErrorResponse(handleServiceError(error, 'DAILY_COMPETITION_CREATE'));
    }
  }
}

export const dailyCompetitionService = new DailyCompetitionService();
