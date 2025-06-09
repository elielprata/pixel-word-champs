
import { supabase } from '@/integrations/supabase/client';
import { getBrasiliaTime } from '@/utils/brasiliaTime';
import { adjustCompetitionEndTime, isCompetitionActive, logCompetitionVerification } from '@/utils/competitionTimeUtils';

export class CompetitionTimeService {
  async adjustCompetitionTimes(competitions: any[]): Promise<void> {
    for (const comp of competitions) {
      const endDate = new Date(comp.end_date);
      const startDate = new Date(comp.start_date);
      
      if (endDate.getUTCHours() !== 23 || endDate.getUTCMinutes() !== 59 || endDate.getUTCSeconds() !== 59) {
        console.log(`🔧 Ajustando horário de fim da competição "${comp.title}" para 23:59:59`);
        
        const correctedEndDate = adjustCompetitionEndTime(startDate);
        
        const { error: updateError } = await supabase
          .from('custom_competitions')
          .update({ 
            end_date: correctedEndDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', comp.id);
        
        if (updateError) {
          console.error('❌ Erro ao atualizar competição:', updateError);
        } else {
          console.log('✅ Competição atualizada com sucesso');
          comp.end_date = correctedEndDate.toISOString();
        }
      }
    }
  }

  filterActiveCompetitions(competitions: any[]): any[] {
    const activeCompetitions = competitions.filter(comp => {
      const startDate = new Date(comp.start_date);
      const endDate = new Date(comp.end_date);
      const now = new Date();
      
      const active = isCompetitionActive(startDate, endDate);
      logCompetitionVerification(comp, active, now);
      
      return active;
    });
    
    console.log('✅ Competições ativas após filtro de data:', activeCompetitions.length);
    
    if (activeCompetitions.length > 0) {
      activeCompetitions.forEach((comp, index) => {
        console.log(`🎯 Competição ativa ${index + 1}:`, {
          id: comp.id,
          title: comp.title,
          description: comp.description,
          theme: comp.theme,
          start_date: comp.start_date,
          end_date: comp.end_date,
          max_participants: comp.max_participants
        });
      });
    } else {
      this.logDebugInfo(competitions);
    }
    
    return activeCompetitions;
  }

  private logDebugInfo(competitions: any[]): void {
    console.log('📅 Nenhuma competição ativa encontrada no período atual');
    
    if (competitions.length > 0) {
      console.log('🔍 Debug - Todas as competições challenge encontradas:');
      competitions.forEach(comp => {
        const startDate = new Date(comp.start_date);
        const endDate = new Date(comp.end_date);
        const now = new Date();
        
        console.log(`- ${comp.title}:`);
        console.log(`  Início: ${startDate.toISOString()}`);
        console.log(`  Fim: ${endDate.toISOString()}`);
        console.log(`  Agora: ${now.toISOString()}`);
        console.log(`  Timestamps - Start: ${startDate.getTime()}, End: ${endDate.getTime()}, Current: ${now.getTime()}`);
        console.log(`  Começou: ${now >= startDate}, Não terminou: ${now <= endDate}`);
      });
    }
  }
}

export const competitionTimeService = new CompetitionTimeService();
