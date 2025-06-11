
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
      logger.log('🏆 Calculando prêmios dinamicamente para', participants.length, 'participantes');

      // Buscar configurações de prêmios
      const prizeConfigs = await prizeService.getPrizeConfigurations();
      const activePrizeConfigs = prizeConfigs.filter(config => config.active);

      logger.log('💰 Configurações de prêmios ativas:', activePrizeConfigs.length);

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

      logger.log('🎯 Prêmios calculados:', {
        totalParticipants: participantsWithPrizes.length,
        winnersCount: participantsWithPrizes.filter(p => p.prize > 0).length,
        totalPrizePool: participantsWithPrizes.reduce((sum, p) => sum + p.prize, 0)
      });

      return participantsWithPrizes;
    } catch (error) {
      logger.error('❌ Erro ao calcular prêmios dinamicamente:', error);
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
      logger.log(`💎 Posição ${position}: R$ ${individualConfig.prize_amount} (individual)`);
      return individualConfig.prize_amount;
    }

    // Buscar configuração de grupo que inclua essa posição
    const groupConfig = configs.find(config => {
      if (config.type !== 'group' || !config.position_range) return false;
      
      const range = this.parsePositionRange(config.position_range);
      return position >= range.start && position <= range.end;
    });

    if (groupConfig) {
      logger.log(`💎 Posição ${position}: R$ ${groupConfig.prize_amount} (grupo: ${groupConfig.position_range})`);
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
    logger.warn(`⚠️ Formato de range inválido: ${range}`);
    return { start: 0, end: 0 };
  }

  private calculateFallbackPrizes(participants: Array<{user_id: string, user_score: number}>): ParticipantWithPrize[] {
    logger.log('⚠️ Usando sistema de prêmios fallback (hardcoded)');
    
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

  async getTotalPrizePool(): Promise<number> {
    try {
      const configs = await prizeService.getPrizeConfigurations();
      const activeConfigs = configs.filter(config => config.active);
      
      let total = 0;
      
      for (const config of activeConfigs) {
        if (config.type === 'individual') {
          total += config.prize_amount;
        } else if (config.type === 'group') {
          // Para grupos, multiplicar o prêmio pelo número de ganhadores
          total += config.prize_amount * config.total_winners;
        }
      }
      
      logger.log('💰 Pool total de prêmios:', total);
      return total;
    } catch (error) {
      logger.error('❌ Erro ao calcular pool de prêmios:', error);
      return 0;
    }
  }
}

export const dynamicPrizeService = new DynamicPrizeService();
