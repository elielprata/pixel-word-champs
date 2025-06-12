
import { supabase } from '@/integrations/supabase/client';
import { getCurrentDateISO, calculateCompetitionStatus } from '@/utils/brasiliaTime';

class CompetitionTimeService {
  /**
   * Atualiza o status das competições baseado no horário atual (VERSÃO CORRIGIDA)
   */
  async updateCompetitionStatuses() {
    try {
      console.log('🔄 [CompetitionTimeService] Atualizando status das competições...');
      
      const now = getCurrentDateISO();
      console.log('⏰ [CompetitionTimeService] Horário atual (Brasília):', now);
      
      // Buscar todas as competições que podem precisar de atualização
      const { data: competitions, error } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date, status, competition_type')
        .neq('status', 'completed');

      if (error) {
        console.error('❌ [CompetitionTimeService] Erro ao buscar competições:', error);
        return;
      }

      if (!competitions?.length) {
        console.log('ℹ️ [CompetitionTimeService] Nenhuma competição para atualizar');
        return;
      }

      console.log(`📋 [CompetitionTimeService] Processando ${competitions.length} competições`);

      let updatedCount = 0;

      // Atualizar status de cada competição
      for (const competition of competitions) {
        const currentStatus = calculateCompetitionStatus(competition.start_date, competition.end_date);
        
        console.log(`🔍 [COMP] "${competition.title}":`, {
          id: competition.id,
          type: competition.competition_type,
          statusAtual: competition.status,
          statusCalculado: currentStatus,
          startDate: competition.start_date,
          endDate: competition.end_date
        });
        
        if (currentStatus !== competition.status) {
          console.log(`🔄 [UPDATE] Atualizando "${competition.title}": ${competition.status} → ${currentStatus}`);
          
          const { error: updateError } = await supabase
            .from('custom_competitions')
            .update({ 
              status: currentStatus,
              updated_at: now
            })
            .eq('id', competition.id);

          if (updateError) {
            console.error(`❌ [UPDATE ERROR] Erro ao atualizar competição ${competition.id}:`, updateError);
          } else {
            console.log(`✅ [UPDATED] Competição "${competition.title}" atualizada para: ${currentStatus}`);
            updatedCount++;
          }
        } else {
          console.log(`✅ [OK] Competição "${competition.title}" já está com status correto: ${currentStatus}`);
        }
      }

      console.log(`✅ [CompetitionTimeService] Atualização concluída: ${updatedCount} competições atualizadas de ${competitions.length}`);
    } catch (error) {
      console.error('❌ [CompetitionTimeService] Erro ao atualizar status das competições:', error);
    }
  }

  /**
   * Verifica se uma competição está ativa no momento
   */
  isCompetitionActive(startDate: string, endDate: string): boolean {
    const status = calculateCompetitionStatus(startDate, endDate);
    const isActive = status === 'active';
    
    console.log('🔍 [isCompetitionActive] Verificação:', {
      startDate,
      endDate,
      status,
      isActive
    });
    
    return isActive;
  }

  /**
   * Obtém o tempo restante para uma competição em segundos
   */
  getTimeRemaining(endDate: string): number {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    const remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
    
    console.log('⏱️ [getTimeRemaining] Tempo restante:', {
      endDate,
      now: now.toISOString(),
      remainingSeconds
    });
    
    return remainingSeconds;
  }

  /**
   * Força atualização de uma competição específica
   */
  async forceUpdateCompetitionStatus(competitionId: string): Promise<boolean> {
    try {
      console.log(`🔧 [forceUpdate] Forçando atualização da competição: ${competitionId}`);
      
      const { data: competition, error: fetchError } = await supabase
        .from('custom_competitions')
        .select('id, title, start_date, end_date, status')
        .eq('id', competitionId)
        .single();

      if (fetchError || !competition) {
        console.error('❌ [forceUpdate] Competição não encontrada:', fetchError);
        return false;
      }

      const correctStatus = calculateCompetitionStatus(competition.start_date, competition.end_date);
      
      if (correctStatus !== competition.status) {
        const { error: updateError } = await supabase
          .from('custom_competitions')
          .update({ 
            status: correctStatus,
            updated_at: getCurrentDateISO()
          })
          .eq('id', competitionId);

        if (updateError) {
          console.error('❌ [forceUpdate] Erro ao atualizar:', updateError);
          return false;
        }

        console.log(`✅ [forceUpdate] Status atualizado: ${competition.status} → ${correctStatus}`);
        return true;
      }

      console.log('✅ [forceUpdate] Status já está correto');
      return true;
    } catch (error) {
      console.error('❌ [forceUpdate] Erro:', error);
      return false;
    }
  }
}

export const competitionTimeService = new CompetitionTimeService();
