
import { supabase } from '@/integrations/supabase/client';
import { getBrasiliaTime, formatBrasiliaTime } from '@/utils/brasiliaTime';

export class CompetitionStatusService {
  /**
   * Calcula o status correto de uma competição baseado no horário de Brasília
   */
  static calculateCorrectStatus(startDate: string, endDate: string): string {
    // Obter horário atual de Brasília
    const brasiliaNow = getBrasiliaTime();
    
    // Converter as datas de início e fim para objetos Date (já estão em UTC no banco)
    const startUTC = new Date(startDate);
    const endUTC = new Date(endDate);
    
    console.log('🔍 Calculando status da competição:');
    console.log('  📅 Início (UTC no banco):', startUTC.toISOString());
    console.log('  📅 Fim (UTC no banco):', endUTC.toISOString());
    console.log('  🕐 Agora (Brasília):', formatBrasiliaTime(brasiliaNow));
    console.log('  🕐 Agora (UTC):', brasiliaNow.toISOString());
    
    // Comparar diretamente os timestamps UTC
    const nowUTC = brasiliaNow.getTime();
    const startTime = startUTC.getTime();
    const endTime = endUTC.getTime();
    
    console.log('  🔢 Comparação timestamps:');
    console.log('    - Início:', startTime);
    console.log('    - Fim:', endTime);
    console.log('    - Agora:', nowUTC);
    
    // Verificar se está no período ativo
    if (nowUTC >= startTime && nowUTC <= endTime) {
      console.log('  ✅ Status: ATIVA');
      return 'active';
    } 
    // Verificar se é futuro
    else if (nowUTC < startTime) {
      console.log('  📅 Status: AGENDADA (futuro)');
      return 'scheduled';
    } 
    // Se passou do horário de fim
    else {
      console.log('  🏁 Status: FINALIZADA (passou do horário)');
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
        .select('id, start_date, end_date, status, competition_type, title')
        .eq('id', competitionId)
        .single();

      if (fetchError || !competition) {
        console.error('❌ Erro ao buscar competição:', fetchError);
        return;
      }

      console.log(`📝 Competição: "${competition.title}" (${competition.competition_type})`);
      console.log(`📊 Status atual: "${competition.status}"`);

      // Calcular status correto
      const correctStatus = this.calculateCorrectStatus(competition.start_date, competition.end_date);
      
      // Atualizar apenas se o status mudou
      if (competition.status !== correctStatus) {
        console.log(`🔧 Atualizando status de "${competition.status}" para "${correctStatus}"`);
        
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
        console.log('ℹ️ Status já está correto, nenhuma atualização necessária');
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
        .select('id, start_date, end_date, status, competition_type, title')
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
          console.log(`🔧 Competição "${competition.title}" (${competition.competition_type}): ${competition.status} → ${correctStatus}`);
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
