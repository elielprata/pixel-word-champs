
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
        .select('id, start_date, end_date, status')
        .eq('id', competitionId)
        .eq('competition_type', 'tournament')
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
   * Atualiza status de todas as competições semanais
   */
  static async updateAllCompetitionsStatus(): Promise<void> {
    try {
      console.log('🔄 Atualizando status de todas as competições...');
      
      // Buscar todas as competições semanais
      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('id, start_date, end_date, status')
        .eq('competition_type', 'tournament');

      if (error || !competitions) {
        console.error('❌ Erro ao buscar competições:', error);
        return;
      }

      // Atualizar cada competição
      for (const competition of competitions) {
        const correctStatus = this.calculateCorrectStatus(competition.start_date, competition.end_date);
        
        if (competition.status !== correctStatus) {
          await this.updateSingleCompetitionStatus(competition.id);
        }
      }
      
      console.log('✅ Atualização de status concluída');
    } catch (error) {
      console.error('❌ Erro ao atualizar status das competições:', error);
    }
  }
}
