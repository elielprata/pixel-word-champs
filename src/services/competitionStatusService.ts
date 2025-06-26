
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

class CompetitionStatusService {
  /**
   * CORRIGIDO: Calcula status correto usando comparação direta de Date objects
   */
  calculateCorrectStatus(competition: { 
    start_date: string; 
    end_date: string; 
    competition_type?: string 
  }): 'scheduled' | 'active' | 'completed' {
    const now = new Date();
    const startUTC = new Date(competition.start_date);
    const endUTC = new Date(competition.end_date);

    logger.debug('Calculando status correto (NOVO SERVIÇO)', {
      nowUTC: now.toISOString(),
      startUTC: startUTC.toISOString(),
      endUTC: endUTC.toISOString(),
      comparison: {
        isBefore: now < startUTC,
        isDuring: now >= startUTC && now <= endUTC,
        isAfter: now > endUTC
      }
    }, 'COMPETITION_STATUS_SERVICE');

    // Comparação direta de Date objects (UTC com UTC)
    if (now < startUTC) {
      return 'scheduled';
    } else if (now >= startUTC && now <= endUTC) {
      return 'active';
    } else {
      return 'completed';
    }
  }

  /**
   * Atualiza status de uma competição específica no banco
   */
  async updateSingleCompetitionStatus(competitionId: string, newStatus: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('custom_competitions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', competitionId);

      if (error) {
        logger.error('Erro ao atualizar status no banco', { competitionId, error }, 'COMPETITION_STATUS_SERVICE');
        return false;
      }

      logger.info('Status atualizado no banco', { competitionId, newStatus }, 'COMPETITION_STATUS_SERVICE');
      return true;
    } catch (error) {
      logger.error('Erro ao atualizar status', { competitionId, error }, 'COMPETITION_STATUS_SERVICE');
      return false;
    }
  }
}

export const competitionStatusService = new CompetitionStatusService();
