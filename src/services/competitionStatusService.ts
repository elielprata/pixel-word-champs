
import { supabase } from '@/integrations/supabase/client';

export class CompetitionStatusService {
  /**
   * Calcula o status correto de uma competição baseado nas datas UTC
   */
  static calculateCorrectStatus(startDate: string, endDate: string): string {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    console.log('🔍 Calculando status da competição:', {
      now: now.toISOString(),
      start: start.toISOString(), 
      end: end.toISOString(),
      nowTime: now.getTime(),
      startTime: start.getTime(),
      endTime: end.getTime(),
      isBeforeStart: now < start,
      isAfterEnd: now > end,
      isActive: now >= start && now <= end
    });
    
    // Verificar se a competição ainda não começou
    if (now < start) {
      console.log('⏳ Competição está AGUARDANDO INÍCIO');
      return 'scheduled';
    } 
    // Verificar se estamos dentro do período da competição
    else if (now >= start && now <= end) {
      console.log('✅ Competição está ATIVA');
      return 'active';
    } 
    // Competição já terminou
    else {
      console.log('🏁 Competição está FINALIZADA');
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
      } else {
        console.log('ℹ️ Status já está correto:', correctStatus);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao atualizar status:', error);
    }
  }

  /**
   * Atualiza status de todas as competições
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

      // Atualizar cada competição
      for (const competition of competitions) {
        console.log(`🔍 Verificando competição: "${competition.title}" (${competition.competition_type})`);
        const correctStatus = this.calculateCorrectStatus(competition.start_date, competition.end_date);
        
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
