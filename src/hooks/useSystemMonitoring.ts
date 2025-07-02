import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface SystemHealthData {
  timestamp: string;
  overall_status: 'healthy' | 'warning' | 'critical';
  metrics: {
    active_users_7d: number;
    total_sessions: number;
    completed_sessions: number;
    completion_rate: number;
    active_competitions: number;
    ranking_integrity: boolean;
  };
  performance: {
    active_connections: number;
    cache_hit_ratio: number;
    total_database_size: string;
  };
  recommendations: string[];
}

interface SystemIntegrityData {
  validation_timestamp: string;
  system_status: 'clean' | 'minor_issues' | 'major_issues';
  issues_count: number;
  issues_found: Array<{
    type: string;
    count: number;
    solution: string;
  }>;
  summary: {
    orphaned_sessions: number;
    invalid_rankings: number;
    missing_profiles: number;
    duplicate_invites: number;
  };
}

interface AdvancedAnalyticsData {
  generated_at: string;
  period: string;
  user_engagement: {
    total_users: number;
    active_users: number;
    engaged_users: number;
    engagement_rate: number;
    avg_games_per_user: number;
    weekly_active_users: number;
    monthly_active_users: number;
    retention_rate: number;
  };
  competition_stats: {
    total_competitions: number;
    active_competitions: number;
    completed_competitions: number;
    avg_duration_days: number;
  };
  growth_metrics: {
    new_users_this_week: number;
    new_users_this_month: number;
    activated_users_this_week: number;
    activation_rate: number;
  };
}

export const useSystemHealth = (autoRefresh = false, interval = 30000) => {
  const [data, setData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchSystemHealth = useCallback(async () => {
    // Evitar chamadas duplicadas em menos de 5 segundos
    const now = Date.now();
    if (now - lastFetch < 5000) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: healthData, error: healthError } = await supabase
        .rpc('system_health_check');
      
      if (healthError) throw healthError;
      
      setData(healthData as unknown as SystemHealthData);
      setLastFetch(now);
      logger.debug('System health data fetched successfully', undefined, 'SYSTEM_HEALTH');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados de saúde';
      setError(errorMessage);
      logger.error('Error fetching system health', err, 'SYSTEM_HEALTH');
      
      // Fallback data em caso de erro
      setData({
        timestamp: new Date().toISOString(),
        overall_status: 'warning',
        metrics: {
          active_users_7d: 0,
          total_sessions: 0,
          completed_sessions: 0,
          completion_rate: 0,
          active_competitions: 0,
          ranking_integrity: false,
        },
        performance: {
          active_connections: 0,
          cache_hit_ratio: 0,
          total_database_size: 'N/A',
        },
        recommendations: ['Sistema temporariamente indisponível'],
      });
    } finally {
      setLoading(false);
    }
  }, [lastFetch]);

  useEffect(() => {
    fetchSystemHealth();
  }, [fetchSystemHealth]);

  useEffect(() => {
    if (autoRefresh && interval >= 10000) { // Mínimo 10 segundos
      const intervalId = setInterval(fetchSystemHealth, interval);
      return () => clearInterval(intervalId);
    }
  }, [autoRefresh, interval, fetchSystemHealth]);

  return { data, loading, error, refresh: fetchSystemHealth };
};

export const useSystemIntegrity = () => {
  const [data, setData] = useState<SystemIntegrityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateSystemIntegrity = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: integrityData, error: integrityError } = await supabase
        .rpc('validate_system_integrity');
      
      if (integrityError) throw integrityError;
      
      setData(integrityData as unknown as SystemIntegrityData);
      logger.debug('System integrity validation completed', undefined, 'SYSTEM_INTEGRITY');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao validar integridade';
      setError(errorMessage);
      logger.error('Error validating system integrity', err, 'SYSTEM_INTEGRITY');
      
      // Fallback data em caso de erro
      setData({
        validation_timestamp: new Date().toISOString(),
        system_status: 'major_issues',
        issues_count: 1,
        issues_found: [{
          type: 'Erro de Conexão',
          count: 1,
          solution: 'Verifique a conectividade com o banco de dados'
        }],
        summary: {
          orphaned_sessions: 0,
          invalid_rankings: 0,
          missing_profiles: 0,
          duplicate_invites: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, validate: validateSystemIntegrity };
};

export const useAdvancedAnalytics = () => {
  const [data, setData] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvancedAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: analyticsData, error: analyticsError } = await supabase
        .rpc('get_advanced_analytics');
      
      if (analyticsError) throw analyticsError;
      
      setData(analyticsData as unknown as AdvancedAnalyticsData);
      logger.debug('Advanced analytics fetched successfully', undefined, 'ADVANCED_ANALYTICS');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar analytics';
      setError(errorMessage);
      logger.error('Error fetching advanced analytics', err, 'ADVANCED_ANALYTICS');
      
      // Fallback data em caso de erro
      setData({
        generated_at: new Date().toISOString(),
        period: 'current',
        user_engagement: {
          total_users: 0,
          active_users: 0,
          engaged_users: 0,
          engagement_rate: 0,
          avg_games_per_user: 0,
          weekly_active_users: 0,
          monthly_active_users: 0,
          retention_rate: 0,
        },
        competition_stats: {
          total_competitions: 0,
          active_competitions: 0,
          completed_competitions: 0,
          avg_duration_days: 0,
        },
        growth_metrics: {
          new_users_this_week: 0,
          new_users_this_month: 0,
          activated_users_this_week: 0,
          activation_rate: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refresh: fetchAdvancedAnalytics };
};