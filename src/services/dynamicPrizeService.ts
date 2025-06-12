
import { supabase } from '@/integrations/supabase/client';
import { prizeService, type PrizeConfiguration } from './prizeService';
import { logger } from '@/utils/logger';

interface ParticipantWithPrize {
  user_id: string;
  position: number;
  score: number;
  prize: number;
}

/**
 * Serviço para calcular prêmios dinamicamente baseado nas configurações
 */
class DynamicPrizeService {
  async calculateDynamicPrizes(participants: Array<{user_id: string, user_score: number}>): Promise<ParticipantWithPrize[]> {
    try {
      logger.info('Calculando prêmios dinamicamente', { participantCount: participants.length }, 'DYNAMIC_PRIZE_SERVICE');

      // Buscar configurações de prêmios
      const prizeConfigs = await prizeService.getPrizeConfigurations();
      const activePrizeConfigs = prizeConfigs.filter(config => config.active);

      logger.debug('Configurações de prêmios ativas carregadas', { count: activePrizeConfigs.length }, 'DYNAMIC_PRIZE_SERVICE');

      // Ordenar participantes por pontuação (maior para menor)
      const sortedParticipants = participants
        .sort((a, b) => (b.user_score || 0) - (a.user_score || 0))
        .map((participant, index) => ({
          user_id: participant.user_id,
          position: index + 1,
          score: participant.user_score || 0,
          prize: 0 // Será calculado abaixo
        }));

      // Calcular prêmios para cada participante
      const participantsWithPrizes = sortedParticipants.map(participant => {
        const prize = this.calculatePrizeForPosition(participant.position, activePrizeConfigs);
        return {
          ...participant,
          prize
        };
      });

      const summaryData = {
        totalParticipants: participantsWithPrizes.length,
        winnersCount: participantsWithPrizes.filter(p => p.prize > 0).length,
        totalPrizePool: participantsWithPrizes.reduce((sum, p) => sum + p.prize, 0)
      };

      logger.info('Prêmios dinâmicos calculados', summaryData, 'DYNAMIC_PRIZE_SERVICE');

      return participantsWithPrizes;
    } catch (error) {
      logger.error('Erro ao calcular prêmios dinamicamente', { error }, 'DYNAMIC_PRIZE_SERVICE');
      // Fallback para o sistema antigo em caso de erro
      return this.calculateFallbackPrizes(participants);
    }
  }

  private calculatePrizeForPosition(position: number, configs: PrizeConfiguration[]): number {
    // Buscar configuração individual por posição específica
    const individualConfig = configs.find(config => 
      config.type === 'individual' && config.position === position
    );

    if (individualConfig) {
      logger.debug('Prêmio individual encontrado', { 
        position, 
        prize: individualConfig.prize_amount 
      }, 'DYNAMIC_PRIZE_SERVICE');
      return individualConfig.prize_amount;
    }

    // Buscar configuração de grupo que inclua essa posição
    const groupConfig = configs.find(config => {
      if (config.type !== 'group' || !config.position_range) return false;
      
      const range = this.parsePositionRange(config.position_range);
      return position >= range.start && position <= range.end;
    });

    if (groupConfig) {
      logger.debug('Prêmio de grupo encontrado', { 
        position, 
        prize: groupConfig.prize_amount,
        range: groupConfig.position_range 
      }, 'DYNAMIC_PRIZE_SERVICE');
      return groupConfig.prize_amount;
    }

    // Sem prêmio para essa posição
    return 0;
  }

  private parsePositionRange(range: string): { start: number, end: number } {
    // Formatos esperados: "4-10", "11-50", "51-100", etc.
    const parts = range.split('-').map(p => parseInt(p.trim()));
    
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { start: parts[0], end: parts[1] };
    }
    
    // Fallback se o formato estiver inválido
    logger.warn('Formato de range inválido', { range }, 'DYNAMIC_PRIZE_SERVICE');
    return { start: 0, end: 0 };
  }

  private calculateFallbackPrizes(participants: Array<{user_id: string, user_score: number}>): ParticipantWithPrize[] {
    logger.warn('Usando sistema de prêmios fallback (hardcoded)', undefined, 'DYNAMIC_PRIZE_SERVICE');
    
    return participants
      .sort((a, b) => (b.user_score || 0) - (a.user_score || 0))
      .map((participant, index) => {
        const position = index + 1;
        let prize = 0;

        // Sistema antigo hardcoded
        if (position === 1) prize = 100;
        else if (position === 2) prize = 50;
        else if (position === 3) prize = 25;
        else if (position <= 10) prize = 10;

        return {
          user_id: participant.user_id,
          position,
          score: participant.user_score || 0,
          prize
        };
      });
  }
}

export const dynamicPrizeService = new DynamicPrizeService();
