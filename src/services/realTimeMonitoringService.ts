
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
}

interface RealTimeAlert {
  id: string;
  type: 'sync_failure' | 'orphaned_scores' | 'system_overload' | 'prize_mismatch';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  auto_resolve: boolean;
}

class RealTimeMonitoringService {
  private metricsChannel: any = null;
  private alertsQueue: RealTimeAlert[] = [];
  private lastHealthCheck: Date | null = null;

  async startMonitoring(): Promise<void> {
    try {
      logger.info('Iniciando monitoramento em tempo real do sistema de ranking', undefined, 'RT_MONITORING');
      
      // Configurar canal para atualizações em tempo real
      this.metricsChannel = supabase
        .channel('ranking-system-monitoring')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'weekly_rankings'
          },
          (payload) => this.handleRankingUpdate(payload)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => this.handleProfileUpdate(payload)
        )
        .subscribe();

      // Iniciar verificação periódica de saúde
      this.startHealthChecks();
      
      logger.info('Monitoramento em tempo real ativado com sucesso', undefined, 'RT_MONITORING');
    } catch (error) {
      logger.error('Erro ao iniciar monitoramento em tempo real', { error }, 'RT_MONITORING');
      throw error;
    }
  }

  async stopMonitoring(): Promise<void> {
    if (this.metricsChannel) {
      await supabase.removeChannel(this.metricsChannel);
      this.metricsChannel = null;
    }
    logger.info('Monitoramento em tempo real desativado', undefined, 'RT_MONITORING');
  }

  private async handleRankingUpdate(payload: any): Promise<void> {
    logger.debug('Atualização detectada no ranking semanal', { payload }, 'RT_MONITORING');
    
    // Verificar integridade após mudanças no ranking
    await this.checkSystemIntegrity();
  }

  private async handleProfileUpdate(payload: any): Promise<void> {
    if (payload.new?.total_score !== payload.old?.total_score) {
      logger.debug('Mudança de pontuação detectada', { 
        userId: payload.new.id,
        oldScore: payload.old?.total_score,
        newScore: payload.new?.total_score 
      }, 'RT_MONITORING');
      
      // Verificar se o ranking precisa ser atualizado
      await this.validateRankingSync();
    }
  }

  private async startHealthChecks(): Promise<void> {
    // Verificação inicial
    await this.performHealthCheck();
    
    // Agendar verificações periódicas (a cada 5 minutos)
    setInterval(async () => {
      await this.performHealthCheck();
    }, 5 * 60 * 1000);
  }

  async performHealthCheck(): Promise<SystemHealthMetrics> {
    try {
      logger.debug('Executando verificação de saúde do sistema', undefined, 'RT_MONITORING');
      
      const [
        activeUsersResult,
        rankingResult,
        orphanedResult,
        prizesResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).gt('total_score', 0),
        supabase.from('weekly_rankings').select('id', { count: 'exact' }),
        supabase.from('game_sessions').select('id', { count: 'exact' }).eq('is_completed', true).is('competition_id', null),
        supabase.from('weekly_rankings').select('prize_amount', { count: 'exact' }).eq('payment_status', 'pending')
      ]);

      const metrics: SystemHealthMetrics = {
        total_active_users: activeUsersResult.count || 0,
        weekly_ranking_size: rankingResult.count || 0,
        orphaned_sessions: orphanedResult.count || 0,
        pending_prizes: prizesResult.count || 0,
        system_load: this.calculateSystemLoad(activeUsersResult.count || 0),
        last_sync_time: new Date().toISOString(),
        sync_status: this.evaluateSyncStatus(orphanedResult.count || 0)
      };

      this.lastHealthCheck = new Date();
      
      // Verificar se há alertas a serem gerados
      await this.evaluateAlerts(metrics);
      
      logger.info('Verificação de saúde concluída', metrics, 'RT_MONITORING');
      return metrics;
    } catch (error) {
      logger.error('Erro na verificação de saúde do sistema', { error }, 'RT_MONITORING');
      throw error;
    }
  }

  private calculateSystemLoad(activeUsers: number): 'low' | 'medium' | 'high' {
    if (activeUsers < 50) return 'low';
    if (activeUsers < 200) return 'medium';
    return 'high';
  }

  private evaluateSyncStatus(orphanedSessions: number): 'healthy' | 'warning' | 'critical' {
    if (orphanedSessions === 0) return 'healthy';
    if (orphanedSessions < 10) return 'warning';
    return 'critical';
  }

  private async evaluateAlerts(metrics: SystemHealthMetrics): Promise<void> {
    // Alerta para sessões órfãs
    if (metrics.orphaned_sessions > 0) {
      await this.createAlert({
        type: 'orphaned_scores',
        severity: metrics.orphaned_sessions > 10 ? 'critical' : 'warning',
        message: `${metrics.orphaned_sessions} sessões órfãs detectadas`,
        auto_resolve: true
      });
    }

    // Alerta para alta carga do sistema
    if (metrics.system_load === 'high') {
      await this.createAlert({
        type: 'system_overload',
        severity: 'warning',
        message: `Sistema com alta carga: ${metrics.total_active_users} usuários ativos`,
        auto_resolve: false
      });
    }

    // Alerta para falha de sincronização
    if (metrics.sync_status === 'critical') {
      await this.createAlert({
        type: 'sync_failure',
        severity: 'critical',
        message: 'Falha crítica na sincronização do ranking',
        auto_resolve: false
      });
    }
  }

  private async createAlert(alertData: Omit<RealTimeAlert, 'id' | 'timestamp'>): Promise<void> {
    const alert: RealTimeAlert = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...alertData
    };

    this.alertsQueue.push(alert);
    logger.warn('Alerta gerado', alert, 'RT_MONITORING');
  }

  async getActiveAlerts(): Promise<RealTimeAlert[]> {
    return this.alertsQueue.filter(alert => 
      // Manter alertas dos últimos 30 minutos
      new Date().getTime() - new Date(alert.timestamp).getTime() < 30 * 60 * 1000
    );
  }

  async resolveAlert(alertId: string): Promise<void> {
    this.alertsQueue = this.alertsQueue.filter(alert => alert.id !== alertId);
    logger.info('Alerta resolvido', { alertId }, 'RT_MONITORING');
  }

  private async checkSystemIntegrity(): Promise<void> {
    try {
      const { data, error } = await supabase.rpc('validate_scoring_integrity');
      
      if (error) throw error;
      
      const validation = data as any;
      if (!validation.validation_passed) {
        await this.createAlert({
          type: 'sync_failure',
          severity: 'warning',
          message: `Problemas de integridade detectados: ${validation.issues.join(', ')}`,
          auto_resolve: true
        });
      }
    } catch (error) {
      logger.error('Erro na verificação de integridade', { error }, 'RT_MONITORING');
    }
  }

  private async validateRankingSync(): Promise<void> {
    try {
      // Verificar se há discrepâncias entre profiles e weekly_rankings
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false });

      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);
      const weekStartStr = currentWeekStart.toISOString().split('T')[0];

      const { data: rankingData } = await supabase
        .from('weekly_rankings')
        .select('user_id, total_score, position')
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true });

      // Comparar dados e identificar discrepâncias
      const discrepancies = this.findSyncDiscrepancies(profilesData || [], rankingData || []);
      
      if (discrepancies.length > 0) {
        await this.createAlert({
          type: 'sync_failure',
          severity: 'warning',
          message: `${discrepancies.length} discrepâncias encontradas entre perfis e ranking`,
          auto_resolve: true
        });
      }
    } catch (error) {
      logger.error('Erro na validação de sincronização', { error }, 'RT_MONITORING');
    }
  }

  private findSyncDiscrepancies(profiles: any[], rankings: any[]): string[] {
    const discrepancies: string[] = [];
    
    for (let i = 0; i < Math.min(profiles.length, rankings.length); i++) {
      const profile = profiles[i];
      const ranking = rankings[i];
      
      if (profile.id !== ranking.user_id) {
        discrepancies.push(`Posição ${i + 1}: usuário diferente`);
      }
      
      if (profile.total_score !== ranking.total_score) {
        discrepancies.push(`Usuário ${profile.id}: pontuação divergente`);
      }
    }
    
    if (profiles.length !== rankings.length) {
      discrepancies.push(`Quantidade diferente: ${profiles.length} perfis vs ${rankings.length} ranking`);
    }
    
    return discrepancies;
  }

  async getCurrentMetrics(): Promise<SystemHealthMetrics | null> {
    if (!this.lastHealthCheck || 
        new Date().getTime() - this.lastHealthCheck.getTime() > 5 * 60 * 1000) {
      return await this.performHealthCheck();
    }
    
    return null; // Usar cache se recente
  }
}

export const realTimeMonitoringService = new RealTimeMonitoringService();
