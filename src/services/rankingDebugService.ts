import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

// Interfaces para tipagem
interface RankingDebugInfo {
  weeklyRankingsCount: number;
  activeProfilesCount: number;
  recentParticipationsCount: number;
  updateFunctionStatus: 'working' | 'error' | 'unknown';
  weekRange: { start: string; end: string };
  topScores: { username: string; score: number }[];
  errors: string[];
}

interface ValidationResult {
  test: string;
  passed: boolean;
  message: string;
}

class RankingDebugService {
  async getRankingDebugInfo(): Promise<RankingDebugInfo> {
    try {
      logger.debug('Coletando informações de debug do ranking', undefined, 'RANKING_DEBUG_SERVICE');

      const startOfWeek = this.getStartOfWeek(new Date());
      const endOfWeek = this.getEndOfWeek(startOfWeek);

      // Verificar rankings semanais
      const { data: weeklyRankings, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select('*')
        .gte('week_start', startOfWeek.toISOString().split('T')[0])
        .lte('week_end', endOfWeek.toISOString().split('T')[0])
        .order('position', { ascending: true });

      if (weeklyError) {
        logger.error('Erro ao buscar rankings semanais para debug', { error: weeklyError }, 'RANKING_DEBUG_SERVICE');
      }

      // Verificar perfis ativos
      const { data: activeProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false })
        .limit(20);

      if (profilesError) {
        logger.error('Erro ao buscar perfis ativos para debug', { error: profilesError }, 'RANKING_DEBUG_SERVICE');
      }

      // Verificar participações em competições
      const { data: recentParticipations, error: participationsError } = await supabase
        .from('competition_participations')
        .select('competition_id, user_score, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (participationsError) {
        logger.error('Erro ao buscar participações para debug', { error: participationsError }, 'RANKING_DEBUG_SERVICE');
      }

      // Status da função de atualização
      let updateFunctionStatus = 'unknown';
      try {
        const { error: functionError } = await supabase.rpc('update_weekly_ranking');
        updateFunctionStatus = functionError ? 'error' : 'working';
        if (functionError) {
          logger.warn('Função update_weekly_ranking com erro', { error: functionError }, 'RANKING_DEBUG_SERVICE');
        }
      } catch (error) {
        logger.warn('Erro ao testar função update_weekly_ranking', { error }, 'RANKING_DEBUG_SERVICE');
        updateFunctionStatus = 'error';
      }

      const debugInfo: RankingDebugInfo = {
        weeklyRankingsCount: weeklyRankings?.length || 0,
        activeProfilesCount: activeProfiles?.length || 0,
        recentParticipationsCount: recentParticipations?.length || 0,
        updateFunctionStatus,
        weekRange: {
          start: startOfWeek.toISOString().split('T')[0],
          end: endOfWeek.toISOString().split('T')[0]
        },
        topScores: activeProfiles?.slice(0, 5).map(p => ({
          username: p.username || 'N/A',
          score: p.total_score || 0
        })) || [],
        errors: [
          ...(weeklyError ? [`Weekly rankings: ${weeklyError.message}`] : []),
          ...(profilesError ? [`Profiles: ${profilesError.message}`] : []),
          ...(participationsError ? [`Participations: ${participationsError.message}`] : [])
        ]
      };

      logger.debug('Informações de debug coletadas', { debugInfo }, 'RANKING_DEBUG_SERVICE');

      return debugInfo;
    } catch (error) {
      logger.error('Erro crítico ao coletar informações de debug', { error }, 'RANKING_DEBUG_SERVICE');
      return {
        weeklyRankingsCount: 0,
        activeProfilesCount: 0,
        recentParticipationsCount: 0,
        updateFunctionStatus: 'error',
        weekRange: { start: '', end: '' },
        topScores: [],
        errors: [`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  async forceRankingUpdate(): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Forçando atualização do ranking', undefined, 'RANKING_DEBUG_SERVICE');

      const { error } = await supabase.rpc('update_weekly_ranking');

      if (error) {
        logger.error('Erro ao forçar atualização do ranking', { error }, 'RANKING_DEBUG_SERVICE');
        return {
          success: false,
          message: `Erro: ${error.message}`
        };
      }

      logger.info('Atualização forçada do ranking executada com sucesso', undefined, 'RANKING_DEBUG_SERVICE');

      return {
        success: true,
        message: 'Ranking atualizado com sucesso'
      };
    } catch (error) {
      logger.error('Erro crítico ao forçar atualização do ranking', { error }, 'RANKING_DEBUG_SERVICE');
      return {
        success: false,
        message: `Erro crítico: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async validateRankingData(): Promise<ValidationResult[]> {
    try {
      logger.debug('Validando dados do ranking', undefined, 'RANKING_DEBUG_SERVICE');

      const validations: ValidationResult[] = [];
      const startOfWeek = this.getStartOfWeek(new Date());
      const endOfWeek = this.getEndOfWeek(startOfWeek);

      // Validação 1: Verificar posições duplicadas
      const { data: duplicatePositions, error: duplicateError } = await supabase
        .from('weekly_rankings')
        .select('position')
        .gte('week_start', startOfWeek.toISOString().split('T')[0])
        .lte('week_end', endOfWeek.toISOString().split('T')[0]);

      if (!duplicateError) {
        const positions = duplicatePositions?.map(r => r.position) || [];
        const uniquePositions = new Set(positions);
        validations.push({
          test: 'Posições únicas',
          passed: positions.length === uniquePositions.size,
          message: positions.length !== uniquePositions.size ? 'Existem posições duplicadas' : 'Todas as posições são únicas'
        });
      }

      // Validação 2: Verificar sequência de posições
      const { data: rankings, error: rankingsError } = await supabase
        .from('weekly_rankings')
        .select('position')
        .gte('week_start', startOfWeek.toISOString().split('T')[0])
        .lte('week_end', endOfWeek.toISOString().split('T')[0])
        .order('position', { ascending: true });

      if (!rankingsError && rankings) {
        const expectedSequence = rankings.map((_, index) => index + 1);
        const actualSequence = rankings.map(r => r.position);
        const sequenceValid = JSON.stringify(expectedSequence) === JSON.stringify(actualSequence);
        
        validations.push({
          test: 'Sequência de posições',
          passed: sequenceValid,
          message: sequenceValid ? 'Sequência de posições correta' : 'Sequência de posições incorreta'
        });
      }

      logger.debug('Validação de dados do ranking concluída', { 
        validationsCount: validations.length 
      }, 'RANKING_DEBUG_SERVICE');

      return validations;
    } catch (error) {
      logger.error('Erro crítico ao validar dados do ranking', { error }, 'RANKING_DEBUG_SERVICE');
      return [{
        test: 'Validação geral',
        passed: false,
        message: `Erro crítico: ${error instanceof Error ? error.message : 'Unknown error'}`
      }];
    }
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(d.setDate(diff));
  }

  private getEndOfWeek(startOfWeek: Date): Date {
    const d = new Date(startOfWeek);
    return new Date(d.setDate(d.getDate() + 6)); // Sunday
  }
}

export const rankingDebugService = new RankingDebugService();
