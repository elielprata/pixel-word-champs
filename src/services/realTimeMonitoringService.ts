
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface SystemHealthMetrics {
  total_active_users: number;
  weekly_ranking_size: number;
  orphaned_sessions: number;
  pending_prizes: number;
  system_load: 'low' | 'medium' | 'high';
  last_sync_time: string;
  sync_status: 'healthy' | 'warning' | 'critical';
  completed_sessions_without_competition: number;
  total_completed_sessions: number;
}

interface RealTimeAlert {
  id: string;
  type: 'sync_failure' | 'orphaned_scores' | 'system_overload' | 'prize_mismatch' | 'orphaned_sessions';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  auto_resolve: boolean;
}

class RealTimeMonitoringService {
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      logger.warn('Monitoramento já está ativo', undefined, 'RT_MONITORING_SERVICE');
      return;
    }

    this.isMonitoring = true;
    logger.info('Iniciando monitoramento em tempo real', undefined, 'RT_MONITORING_SERVICE');

    // Monitoramento a cada 30 segundos
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logger.error('Erro no monitoramento automático', { error }, 'RT_MONITORING_SERVICE');
      }
    }, 30000);
  }

  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    logger.info('Monitoramento em tempo real parado', undefined, 'RT_MONITORING_SERVICE');
  }

  async performHealthCheck(): Promise<SystemHealthMetrics> {
    try {
      logger.debug('Executando verificação de saúde do sistema', undefined, 'RT_MONITORING_SERVICE');

      // Contar usuários ativos (com pontuação > 0)
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('total_score', 0);

      // Contar registros no ranking semanal
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);
      const weekStartISO = currentWeekStart.toISOString().split('T')[0];

      const { count: weeklyRankingSize } = await supabase
        .from('weekly_rankings')
        .select('*', { count: 'exact', head: true })
        .eq('week_start', weekStartISO);

      // Contar sessões órfãs (completadas sem competition_id)
      const { count: orphanedSessions } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)
        .is('competition_id', null);

      // Contar total de sessões completadas
      const { count: totalCompletedSessions } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true);

      // Contar prêmios pendentes
      const { count: pendingPrizes } = await supabase
        .from('prize_distributions')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'pending');

      const metrics: SystemHealthMetrics = {
        total_active_users: activeUsers || 0,
        weekly_ranking_size: weeklyRankingSize || 0,
        orphaned_sessions: orphanedSessions || 0,
        completed_sessions_without_competition: orphanedSessions || 0,
        total_completed_sessions: totalCompletedSessions || 0,
        pending_prizes: pendingPrizes || 0,
        system_load: this.calculateSystemLoad(activeUsers || 0),
        last_sync_time: new Date().toISOString(),
        sync_status: this.determineSyncStatus(orphanedSessions || 0, activeUsers || 0, weeklyRankingSize || 0)
      };

      logger.info('Verificação de saúde concluída', metrics, 'RT_MONITORING_SERVICE');
      return metrics;

    } catch (error) {
      logger.error('Erro na verificação de saúde do sistema', { error }, 'RT_MONITORING_SERVICE');
      throw error;
    }
  }

  async getActiveAlerts(): Promise<RealTimeAlert[]> {
    try {
      const alerts: RealTimeAlert[] = [];
      const metrics = await this.performHealthCheck();

      // Alerta para sessões órfãs
      if (metrics.orphaned_sessions > 0) {
        alerts.push({
          id: 'orphaned_sessions_' + Date.now(),
          type: 'orphaned_sessions',
          severity: metrics.orphaned_sessions > 10 ? 'critical' : 'warning',
          message: `${metrics.orphaned_sessions} sessões completadas sem vinculação a competições detectadas`,
          timestamp: new Date().toISOString(),
          auto_resolve: false
        });
      }

      // Alerta para discrepância entre usuários ativos e ranking
      if (metrics.total_active_users > metrics.weekly_ranking_size) {
        const difference = metrics.total_active_users - metrics.weekly_ranking_size;
        alerts.push({
          id: 'ranking_sync_' + Date.now(),
          type: 'sync_failure',
          severity: difference > 5 ? 'critical' : 'warning',
          message: `${difference} usuários com pontuação não estão no ranking semanal`,
          timestamp: new Date().toISOString(),
          auto_resolve: false
        });
      }

      // Alerta para carga do sistema
      if (metrics.system_load === 'high') {
        alerts.push({
          id: 'system_load_' + Date.now(),
          type: 'system_overload',
          severity: 'warning',
          message: 'Carga alta do sistema detectada',
          timestamp: new Date().toISOString(),
          auto_resolve: true
        });
      }

      logger.debug('Alertas ativos coletados', { alertsCount: alerts.length }, 'RT_MONITORING_SERVICE');
      return alerts;

    } catch (error) {
      logger.error('Erro ao coletar alertas ativos', { error }, 'RT_MONITORING_SERVICE');
      return [];
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    logger.info('Resolvendo alerta', { alertId }, 'RT_MONITORING_SERVICE');
    // Implementação futura: marcar alerta como resolvido em tabela de alertas
  }

  private calculateSystemLoad(activeUsers: number): 'low' | 'medium' | 'high' {
    if (activeUsers < 50) return 'low';
    if (activeUsers < 200) return 'medium';
    return 'high';
  }

  private determineSyncStatus(orphanedSessions: number, activeUsers: number, rankingSize: number): 'healthy' | 'warning' | 'critical' {
    if (orphanedSessions > 10) return 'critical';
    if (orphanedSessions > 0 || Math.abs(activeUsers - rankingSize) > 5) return 'warning';
    return 'healthy';
  }
}

export const realTimeMonitoringService = new RealTimeMonitoringService();
