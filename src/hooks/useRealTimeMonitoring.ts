
import { useState, useEffect } from 'react';
import { realTimeMonitoringService } from '@/services/realTimeMonitoringService';
import { useToast } from "@/hooks/use-toast";
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

export const useRealTimeMonitoring = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SystemHealthMetrics | null>(null);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startMonitoring = async () => {
    try {
      setIsLoading(true);
      await realTimeMonitoringService.startMonitoring();
      setIsMonitoring(true);
      
      toast({
        title: "✅ Monitoramento Ativado",
        description: "Sistema de monitoramento em tempo real iniciado",
      });
      
      // Carregar métricas iniciais
      await loadMetrics();
      await loadAlerts();
      
    } catch (error) {
      toast({
        title: "Erro no Monitoramento",
        description: "Falha ao iniciar monitoramento em tempo real",
        variant: "destructive",
      });
      logger.error('Erro ao iniciar monitoramento', { error }, 'RT_MONITORING_HOOK');
    } finally {
      setIsLoading(false);
    }
  };

  const stopMonitoring = async () => {
    try {
      await realTimeMonitoringService.stopMonitoring();
      setIsMonitoring(false);
      
      toast({
        title: "Monitoramento Desativado",
        description: "Sistema de monitoramento foi pausado",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao parar monitoramento",
        variant: "destructive",
      });
    }
  };

  const loadMetrics = async () => {
    try {
      const currentMetrics = await realTimeMonitoringService.performHealthCheck();
      setMetrics(currentMetrics);
    } catch (error) {
      logger.error('Erro ao carregar métricas', { error }, 'RT_MONITORING_HOOK');
    }
  };

  const loadAlerts = async () => {
    try {
      const currentAlerts = await realTimeMonitoringService.getActiveAlerts();
      setAlerts(currentAlerts);
      
      // Mostrar toast para alertas críticos
      const criticalAlerts = currentAlerts.filter(alert => alert.severity === 'critical');
      if (criticalAlerts.length > 0) {
        criticalAlerts.forEach(alert => {
          toast({
            title: "🚨 Alerta Crítico",
            description: alert.message,
            variant: "destructive",
          });
        });
      }
    } catch (error) {
      logger.error('Erro ao carregar alertas', { error }, 'RT_MONITORING_HOOK');
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await realTimeMonitoringService.resolveAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      toast({
        title: "Alerta Resolvido",
        description: "Alerta marcado como resolvido",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao resolver alerta",
        variant: "destructive",
      });
    }
  };

  const refreshMetrics = async () => {
    setIsLoading(true);
    try {
      await loadMetrics();
      await loadAlerts();
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh métricas a cada 30 segundos quando monitoramento ativo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      interval = setInterval(async () => {
        await loadMetrics();
        await loadAlerts();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  // Carregar dados iniciais
  useEffect(() => {
    loadMetrics();
    loadAlerts();
  }, []);

  return {
    metrics,
    alerts,
    isMonitoring,
    isLoading,
    startMonitoring,
    stopMonitoring,
    resolveAlert,
    refreshMetrics
  };
};
