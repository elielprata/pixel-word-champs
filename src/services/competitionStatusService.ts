
import { supabase } from '@/integrations/supabase/client';
import { getBrasiliaTime, isDateInCurrentBrasiliaRange, isBrasiliaDateInFuture } from '@/utils/brasiliaTime';

export class CompetitionStatusService {
  /**
   * Calcula o status correto de uma competição baseado no horário de Brasília
   */
  static calculateCorrectStatus(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isDateInCurrentBrasiliaRange(start, end)) {
      return 'active';
    } else if (isBrasiliaDateInFuture(start)) {
      return 'scheduled';
    } else {
      return 'completed';
    }
  }

  /**
   * Atualiza o status de uma competição específica
   */
  static async updateSingleCompetitionStatus(competitionId: string): Promise<void> {
    try {
      console.log('🔄 Atualizando status da competição:', competitionId);
      
      // Buscar dados da competição
      const { data: competition, error: fetchError } = await supabase
        .from('custom_competitions')
        .select('id, start_date, end_date, status, competition_type')
        .eq('id', competitionId)
        .single();

      if (fetchError || !competition) {
        console.error('❌ Erro ao buscar competição:', fetchError);
        return;
      }

      // Calcular status correto
      const correctStatus = this.calculateCorrectStatus(competition.start_date, competition.end_date);
      
      // Atualizar apenas se o status mudou
      if (competition.status !== correctStatus) {
        console.log(`📝 Atualizando status de "${competition.status}" para "${correctStatus}"`);
        
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
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao atualizar status:', error);
    }
  }

  /**
   * Atualiza status de todas as competições (semanais e diárias)
   */
  static async updateAllCompetitionsStatus(): Promise<void> {
    try {
      console.log('🔄 Atualizando status de todas as competições...');
      
      // Buscar todas as competições (semanais e diárias)
      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('id, start_date, end_date, status, competition_type')
        .in('competition_type', ['tournament', 'challenge']);

      if (error || !competitions) {
        console.error('❌ Erro ao buscar competições:', error);
        return;
      }

      console.log(`📊 Verificando ${competitions.length} competições (semanais e diárias)`);

      // Atualizar cada competição
      for (const competition of competitions) {
        const correctStatus = this.calculateCorrectStatus(competition.start_date, competition.end_date);
        
        if (competition.status !== correctStatus) {
          console.log(`🔧 Competição ${competition.id} (${competition.competition_type}): ${competition.status} → ${correctStatus}`);
          await this.updateSingleCompetitionStatus(competition.id);
        }
      }
      
      console.log('✅ Atualização de status concluída');
    } catch (error) {
      console.error('❌ Erro ao atualizar status das competições:', error);
    }
  }

  /**
   * Força atualização imediata de todas as competições
   */
  static async forceUpdateAllStatuses(): Promise<void> {
    try {
      console.log('⚡ Forçando atualização imediata de todos os status...');
      await this.updateAllCompetitionsStatus();
      
      // Aguardar um pouco e verificar novamente para garantir
      setTimeout(async () => {
        console.log('🔄 Segunda verificação de status...');
        await this.updateAllCompetitionsStatus();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro na atualização forçada:', error);
    }
  }
}
