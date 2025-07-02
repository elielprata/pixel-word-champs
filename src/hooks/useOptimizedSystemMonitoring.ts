import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SystemMonitoringCache {
  private cache = new Map<string, CachedData<any>>();
  
  set<T>(key: string, data: T, ttlMinutes = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }
  
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const cache = new SystemMonitoringCache();

export const useOptimizedSystemHealth = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchWithRetry = useCallback(async () => {
    const cacheKey = 'system_health';
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: healthData, error: healthError } = await supabase
        .rpc('system_health_check');
      
      if (healthError) throw healthError;
      
      setData(healthData);
      cache.set(cacheKey, healthData, 2); // Cache por 2 minutos
      retryCountRef.current = 0;
      
    } catch (err) {
      retryCountRef.current++;
      
      if (retryCountRef.current <= maxRetries) {
        // Retry exponencial: 2s, 4s, 8s
        const delay = Math.pow(2, retryCountRef.current) * 1000;
        setTimeout(fetchWithRetry, delay);
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados de saúde';
      setError(errorMessage);
      logger.error('System health fetch failed after retries', err, 'OPTIMIZED_MONITORING');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    cache.clear();
    retryCountRef.current = 0;
    fetchWithRetry();
  }, [fetchWithRetry]);

  useEffect(() => {
    fetchWithRetry();
  }, [fetchWithRetry]);

  return { data, loading, error, refresh };
};

export const useOptimizedSystemIntegrity = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(async () => {
    const cacheKey = 'system_integrity';
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: integrityData, error: integrityError } = await supabase
        .rpc('validate_system_integrity');
      
      if (integrityError) throw integrityError;
      
      setData(integrityData);
      cache.set(cacheKey, integrityData, 10); // Cache por 10 minutos
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao validar integridade';
      setError(errorMessage);
      logger.error('System integrity validation failed', err, 'OPTIMIZED_MONITORING');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, validate };
};