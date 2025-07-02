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

  const fetchSystemHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: healthData, error: healthError } = await supabase
        .rpc('system_health_check');
      
      if (healthError) throw healthError;
      
      setData(healthData as unknown as SystemHealthData);
      logger.debug('System health data fetched successfully', healthData, 'SYSTEM_HEALTH');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      logger.error('Error fetching system health', err, 'SYSTEM_HEALTH');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemHealth();
  }, [fetchSystemHealth]);

  useEffect(() => {
    if (autoRefresh) {
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
      logger.debug('System integrity data fetched successfully', integrityData, 'SYSTEM_INTEGRITY');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      logger.error('Error validating system integrity', err, 'SYSTEM_INTEGRITY');
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
      logger.debug('Advanced analytics data fetched successfully', analyticsData, 'ADVANCED_ANALYTICS');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      logger.error('Error fetching advanced analytics', err, 'ADVANCED_ANALYTICS');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refresh: fetchAdvancedAnalytics };
};