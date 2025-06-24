
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';

interface DependencyAnalysis {
  totalDailyCompetitions: number;
  dailyCompetitionsWithWeeklyLink: number;
  activeWeeklyTournaments: number;
  orphanedDailyCompetitions: number;
  weeklyRankingUsers: number;
  completedSessionsWithoutCompetition: number;
  totalCompletedSessions: number;
  systemHealthStatus: 'safe' | 'warning' | 'critical';
  migrationRisks: string[];
  recommendations: string[];
}

class MigrationImpactAnalysisService {
  async performFullSystemAnalysis(): Promise<DependencyAnalysis> {
    try {
      secureLogger.info('Iniciando análise completa de impacto da migração', undefined, 'MIGRATION_ANALYSIS');

      // 1. Analisar competições diárias
      const dailyCompetitionsAnalysis = await this.analyzeDailyCompetitions();
      
      // 2. Analisar competições semanais/torneios
      const weeklyTournamentsAnalysis = await this.analyzeWeeklyTournaments();
      
      // 3. Analisar ranking semanal atual
      const weeklyRankingAnalysis = await this.analyzeWeeklyRanking();
      
      // 4. Analisar sessões órfãs
      const orphanedSessionsAnalysis = await this.analyzeOrphanedSessions();
      
      // 5. Calcular riscos e recomendações
      const risks = this.calculateMigrationRisks({
        dailyCompetitionsAnalysis,
        weeklyTournamentsAnalysis,
        weeklyRankingAnalysis,
        orphanedSessionsAnalysis
      });

      const analysis: DependencyAnalysis = {
        totalDailyCompetitions: dailyCompetitionsAnalysis.total,
        dailyCompetitionsWithWeeklyLink: dailyCompetitionsAnalysis.withWeeklyLink,
        activeWeeklyTournaments: weeklyTournamentsAnalysis.active,
        orphanedDailyCompetitions: dailyCompetitionsAnalysis.orphaned,
        weeklyRankingUsers: weeklyRankingAnalysis.totalUsers,
        completedSessionsWithoutCompetition: orphanedSessionsAnalysis.orphaned,
        totalCompletedSessions: orphanedSessionsAnalysis.total,
        systemHealthStatus: risks.healthStatus,
        migrationRisks: risks.risks,
        recommendations: risks.recommendations
      };

      secureLogger.info('Análise de impacto concluída', { analysis }, 'MIGRATION_ANALYSIS');
      return analysis;

    } catch (error) {
      secureLogger.error('Erro na análise de impacto', { error }, 'MIGRATION_ANALYSIS');
      throw error;
    }
  }

  private async analyzeDailyCompetitions() {
    const { data: dailyCompetitions, error } = await supabase
      .from('custom_competitions')
      .select('id, title, weekly_tournament_id, status, competition_type')
      .eq('competition_type', 'challenge');

    if (error) throw error;

    const total = dailyCompetitions?.length || 0;
    const withWeeklyLink = dailyCompetitions?.filter(c => c.weekly_tournament_id).length || 0;
    const orphaned = dailyCompetitions?.filter(c => !c.weekly_tournament_id).length || 0;

    return { total, withWeeklyLink, orphaned };
  }

  private async analyzeWeeklyTournaments() {
    const { data: weeklyTournaments, error } = await supabase
      .from('custom_competitions')
      .select('id, title, status, competition_type')
      .eq('competition_type', 'tournament');

    if (error) throw error;

    const total = weeklyTournaments?.length || 0;
    const active = weeklyTournaments?.filter(t => 
      t.status === 'active' || t.status === 'scheduled'
    ).length || 0;

    return { total, active };
  }

  private async analyzeWeeklyRanking() {
    // Calcular semana atual
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const { data: weeklyRanking, error } = await supabase
      .from('weekly_rankings')
      .select('user_id')
      .eq('week_start', weekStart.toISOString().split('T')[0]);

    if (error) throw error;

    return { totalUsers: weeklyRanking?.length || 0 };
  }

  private async analyzeOrphanedSessions() {
    const { count: orphaned } = await supabase
      .from('game_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true)
      .is('competition_id', null);

    const { count: total } = await supabase
      .from('game_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true);

    return { orphaned: orphaned || 0, total: total || 0 };
  }

  private calculateMigrationRisks(data: any) {
    const risks: string[] = [];
    const recommendations: string[] = [];
    let healthStatus: 'safe' | 'warning' | 'critical' = 'safe';

    // Verificar dependências críticas
    if (data.dailyCompetitionsAnalysis.withWeeklyLink > 0) {
      risks.push(`${data.dailyCompetitionsAnalysis.withWeeklyLink} competições diárias ainda dependem de torneios semanais`);
      recommendations.push('Migrar competições diárias para sistema independente antes da limpeza');
      healthStatus = 'warning';
    }

    if (data.weeklyTournamentsAnalysis.active > 0) {
      risks.push(`${data.weeklyTournamentsAnalysis.active} torneios semanais ainda ativos`);
      recommendations.push('Finalizar ou migrar torneios ativos antes da remoção');
      healthStatus = 'critical';
    }

    if (data.orphanedSessionsAnalysis.orphaned > 100) {
      risks.push(`${data.orphanedSessionsAnalysis.orphaned} sessões órfãs detectadas`);
      recommendations.push('Limpar sessões órfãs para melhorar performance');
      if (healthStatus === 'safe') healthStatus = 'warning';
    }

    // Verificar se ranking semanal é independente
    if (data.weeklyRankingAnalysis.totalUsers > 0) {
      recommendations.push('Sistema de ranking semanal funcionando independentemente - migração segura');
    }

    return { risks, recommendations, healthStatus };
  }

  async generateMigrationPlan(): Promise<string[]> {
    const analysis = await this.performFullSystemAnalysis();
    
    const plan: string[] = [];
    
    if (analysis.systemHealthStatus === 'critical') {
      plan.push('🚨 MIGRAÇÃO CRÍTICA - Requer atenção imediata');
      plan.push('1. Finalizar todos os torneios semanais ativos');
      plan.push('2. Migrar competições diárias vinculadas');
      plan.push('3. Validar funcionamento do ranking semanal');
      plan.push('4. Realizar limpeza gradual');
    } else if (analysis.systemHealthStatus === 'warning') {
      plan.push('⚠️ MIGRAÇÃO COM CUIDADO - Dependências detectadas');
      plan.push('1. Migrar competições diárias para sistema independente');
      plan.push('2. Limpar sessões órfãs');
      plan.push('3. Validar ranking semanal');
      plan.push('4. Remover dependências antigas');
    } else {
      plan.push('✅ MIGRAÇÃO SEGURA - Sistema pronto para limpeza');
      plan.push('1. Backup de segurança');
      plan.push('2. Remover tabelas redundantes');
      plan.push('3. Simplificar interfaces');
      plan.push('4. Monitorar sistema');
    }

    return plan;
  }
}

export const migrationImpactAnalysisService = new MigrationImpactAnalysisService();
