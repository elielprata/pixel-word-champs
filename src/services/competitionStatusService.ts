
import { supabase } from '@/integrations/supabase/client';
import { getBrasiliaTime, createBrasiliaStartOfDay, createBrasiliaEndOfDay, formatBrasiliaTime } from '@/utils/brasiliaTime';

export class CompetitionStatusService {
  /**
   * Calcula o status correto de uma competição diária baseado nas regras específicas
   * Competições diárias sempre devem ter:
   * - Início: 00:00:00 do dia
   * - Fim: 23:59:59 do mesmo dia
   * - Status baseado no horário atual de Brasília
   */
  static calculateDailyCompetitionStatus(competitionDate: string): string {
    const now = getBrasiliaTime();
    const competitionDay = new Date(competitionDate);
    
    // Criar início e fim do dia da competição em Brasília
    const dayStart = createBrasiliaStartOfDay(competitionDay);
    const dayEnd = createBrasiliaEndOfDay(competitionDay);
    
    console.log('🔍 Calculando status da competição diária:', {
      competitionDate,
      now: formatBrasiliaTime(now),
      dayStart: formatBrasiliaTime(dayStart),
      dayEnd: formatBrasiliaTime(dayEnd),
      isBeforeStart: now < dayStart,
      isAfterEnd: now > dayEnd,
      isActive: now >= dayStart && now <= dayEnd
    });
    
    // CORREÇÃO: Usar horário de Brasília para comparação
    const nowBrasilia = getBrasiliaTime();
    const dayStartBrasilia = new Date(competitionDay);
    dayStartBrasilia.setHours(0, 0, 0, 0);
    
    const dayEndBrasilia = new Date(competitionDay);
    dayEndBrasilia.setHours(23, 59, 59, 999);
    
    console.log('🇧🇷 Comparação em horário de Brasília:', {
      nowBrasilia: formatBrasiliaTime(nowBrasilia),
      dayStartBrasilia: formatBrasiliaTime(dayStartBrasilia),
      dayEndBrasilia: formatBrasiliaTime(dayEndBrasilia),
    });
    
    // Regras específicas para competições diárias em horário de Brasília:
    
    // Status: Aguardando - Quando a data/hora atual for anterior a 00:00:00 do dia da competição
    if (nowBrasilia < dayStartBrasilia) {
      console.log('⏳ Competição diária está AGUARDANDO INÍCIO (antes de 00:00:00)');
      return 'scheduled';
    } 
    // Status: Ativa - Quando a data/hora atual estiver entre 00:00:00 e 23:59:59 do mesmo dia
    else if (nowBrasilia >= dayStartBrasilia && nowBrasilia <= dayEndBrasilia) {
      console.log('✅ Competição diária está ATIVA (00:00:00 às 23:59:59)');
      return 'active';
    } 
    // Status: Finalizada - Quando a data/hora atual for posterior a 23:59:59 do mesmo dia
    else {
      console.log('🏁 Competição diária está FINALIZADA (após 23:59:59)');
      return 'completed';
    }
  }

  /**
   * Calcula o status correto de uma competição baseado nas datas UTC (para competições semanais)
   */
  static calculateCorrectStatus(startDate: string, endDate: string): string {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    console.log('🔍 Calculando status da competição (formato padrão):', {
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
        .select('id, start_date, end_date, status, competition_type, title')
        .eq('id', competitionId)
        .single();

      if (fetchError || !competition) {
        console.error('❌ Erro ao buscar competição:', fetchError);
        return;
      }

      let correctStatus: string;

      // Aplicar regras específicas para competições diárias
      if (competition.competition_type === 'challenge') {
        console.log('📅 Aplicando regras de status para competição DIÁRIA');
        correctStatus = this.calculateDailyCompetitionStatus(competition.start_date);
      } else {
        console.log('📊 Aplicando regras de status para competição SEMANAL/PADRÃO');
        correctStatus = this.calculateCorrectStatus(competition.start_date, competition.end_date);
      }
      
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
        
        let correctStatus: string;

        // Aplicar regras específicas baseadas no tipo
        if (competition.competition_type === 'challenge') {
          correctStatus = this.calculateDailyCompetitionStatus(competition.start_date);
        } else {
          correctStatus = this.calculateCorrectStatus(competition.start_date, competition.end_date);
        }
        
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
