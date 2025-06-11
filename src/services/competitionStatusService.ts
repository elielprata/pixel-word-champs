
import { supabase } from '@/integrations/supabase/client';
import { calculateDailyCompetitionStatus, calculateWeeklyCompetitionStatus } from '@/utils/brasiliaTime';

export class CompetitionStatusService {
  /**
   * FUNÇÃO UNIFICADA: Calcula o status correto baseado no tipo de competição
   * REMOVIDO: Duplicação de lógica - agora usa funções centralizadas
   */
  static calculateCorrectStatus(competition: { competition_type?: string; start_date: string; end_date: string }): string {
    // Para competições diárias, usar lógica específica de Brasília
    if (competition.competition_type === 'challenge') {
      console.log('📅 Aplicando regras de status para competição DIÁRIA');
      return calculateDailyCompetitionStatus(competition.start_date);
    } else {
      console.log('📊 Aplicando regras de status para competição SEMANAL/PADRÃO');
      return calculateWeeklyCompetitionStatus(competition.start_date, competition.end_date);
    }
  }

  /**
   * Atualiza o status de uma competição específica
   * SIMPLIFICADO: Removida duplicação de lógica
   */
  static async updateSingleCompetitionStatus(competitionId: string): Promise<void> {
    try {
      console.log('🔄 Atualizando status da competição:', competitionId);
      
      // Buscar dados da competição
      const { data: competition, error: fetchError } = await supabase
        .from('custom_competitions')
        .select('id, start_date, end_date, status, competition_type, title')
        .eq('id', competitionId)
        .single();

      if (fetchError || !competition) {
        console.error('❌ Erro ao buscar competição:', fetchError);
        return;
      }

      // Usar a função unificada para calcular o status correto
      const correctStatus = this.calculateCorrectStatus(competition);
      
      // Atualizar apenas se o status mudou
      if (competition.status !== correctStatus) {
        console.log(`📝 Atualizando status de "${competition.status}" para "${correctStatus}" (${competition.title})`);
        
        const { error: updateError } = await supabase
          .from('custom_competitions')
          .update({ 
            status: correctStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', competitionId);

        if (updateError) {
          console.error('❌ Erro ao atualizar status:', updateError);
        } else {
          console.log('✅ Status atualizado com sucesso');
        }
      } else {
        console.log('ℹ️ Status já está correto:', correctStatus);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao atualizar status:', error);
    }
  }

  /**
   * Atualiza status de todas as competições
   * SIMPLIFICADO: Usa a lógica unificada
   */
  static async updateAllCompetitionsStatus(): Promise<void> {
    try {
      console.log('🔄 Atualizando status de todas as competições...');
      
      // Buscar todas as competições
      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('id, start_date, end_date, status, title, competition_type');

      if (error || !competitions) {
        console.error('❌ Erro ao buscar competições:', error);
        return;
      }

      console.log(`📋 Encontradas ${competitions.length} competições para verificar`);

      // Atualizar cada competição usando a lógica unificada
      for (const competition of competitions) {
        console.log(`🔍 Verificando competição: "${competition.title}" (${competition.competition_type})`);
        
        const correctStatus = this.calculateCorrectStatus(competition);
        
        if (competition.status !== correctStatus) {
          console.log(`🔄 Necessária atualização: ${competition.status} → ${correctStatus}`);
          await this.updateSingleCompetitionStatus(competition.id);
        } else {
          console.log(`✅ Status já correto: ${correctStatus}`);
        }
      }
      
      console.log('✅ Atualização de status concluída');
    } catch (error) {
      console.error('❌ Erro ao atualizar status das competições:', error);
    }
  }
}
