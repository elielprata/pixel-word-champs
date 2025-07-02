/**
 * SISTEMA DE OTIMIZAÇÃO DE PERFORMANCE - FASE 4
 * 
 * Utilitários para otimização de performance em produção
 */

import { logger } from './logger';

// Cache para queries frequentes
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Configurações de performance
export const performanceConfig = {
  // Cache TTL em milliseconds
  queryCacheTTL: 5 * 60 * 1000, // 5 minutos
  imageCacheTTL: 24 * 60 * 60 * 1000, // 24 horas
  
  // Debounce delays
  searchDebounceMs: 300,
  resizeDebounceMs: 100,
  
  // Limites de performance
  maxCacheSize: 100,
  maxImageCacheSize: 50,
  
  // Thresholds
  slowQueryThreshold: 1000, // 1 segundo
  largePayloadThreshold: 100 * 1024, // 100KB
};

// Cache de queries com TTL
export const cacheQuery = <T>(key: string, data: T, ttl: number = performanceConfig.queryCacheTTL): void => {
  // Limpar cache se atingir limite
  if (queryCache.size >= performanceConfig.maxCacheSize) {
    const oldestKey = Array.from(queryCache.keys())[0];
    queryCache.delete(oldestKey);
  }
  
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
  
  logger.debug('Query cached', { key, size: queryCache.size }, 'PERFORMANCE');
};

// Recuperar query do cache
export const getCachedQuery = <T>(key: string): T | null => {
  const cached = queryCache.get(key);
  
  if (!cached) {
    return null;
  }
  
  // Verificar se expirou
  if (Date.now() - cached.timestamp > cached.ttl) {
    queryCache.delete(key);
    logger.debug('Cache expired', { key }, 'PERFORMANCE');
    return null;
  }
  
  logger.debug('Cache hit', { key }, 'PERFORMANCE');
  return cached.data as T;
};

// Limpar cache expirado
export const cleanExpiredCache = (): void => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [key, cached] of queryCache.entries()) {
    if (now - cached.timestamp > cached.ttl) {
      queryCache.delete(key);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    logger.info('Cache cleanup completed', { cleanedCount, remaining: queryCache.size }, 'PERFORMANCE');
  }
};

// Debounce function otimizada
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Medição de performance de funções
export const measurePerformance = async <T>(
  label: string,
  operation: () => Promise<T> | T
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - start;
    
    if (duration > performanceConfig.slowQueryThreshold) {
      logger.warn('Slow operation detected', { label, duration }, 'PERFORMANCE');
    } else {
      logger.debug('Operation completed', { label, duration }, 'PERFORMANCE');
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error('Operation failed', { label, duration, error }, 'PERFORMANCE');
    throw error;
  }
};

// Lazy loading de imagens
export const createLazyImageObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  const options = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };
  
  return new IntersectionObserver(callback, options);
};

// Preload de recursos críticos
export const preloadResource = (url: string, type: 'script' | 'style' | 'image' | 'font' = 'script'): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  
  switch (type) {
    case 'style':
      link.as = 'style';
      break;
    case 'image':
      link.as = 'image';
      break;
    case 'font':
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      break;
    default:
      link.as = 'script';
  }
  
  document.head.appendChild(link);
  logger.debug('Resource preloaded', { url, type }, 'PERFORMANCE');
};

// Otimização de Virtual Scrolling
export const calculateVirtualScrollItems = (
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  scrollTop: number,
  overscan: number = 5
) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);
  
  return {
    startIndex,
    endIndex,
    visibleCount,
    totalHeight: totalItems * itemHeight
  };
};

// Monitor de performance da página
export const initializePerformanceMonitoring = (): void => {
  if (typeof window === 'undefined') return;
  
  // Monitor de métricas vitais
  if ('PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        logger.info('LCP measured', { 
          value: lastEntry.startTime,
          entryType: lastEntry.entryType
        }, 'PERFORMANCE');
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          logger.info('FID measured', { 
            value: entry.processingStart - entry.startTime 
          }, 'PERFORMANCE');
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
      
    } catch (error) {
      logger.warn('Performance monitoring setup failed', { error }, 'PERFORMANCE');
    }
  }
  
  // Limpeza automática de cache
  setInterval(cleanExpiredCache, 5 * 60 * 1000); // A cada 5 minutos
  
  logger.info('Performance monitoring initialized', {
    cacheSize: queryCache.size,
    config: performanceConfig
  }, 'PERFORMANCE');
};

// Status da otimização
export const getPerformanceStatus = () => ({
  cacheSize: queryCache.size,
  maxCacheSize: performanceConfig.maxCacheSize,
  cacheUtilization: (queryCache.size / performanceConfig.maxCacheSize) * 100,
  isOptimized: queryCache.size < performanceConfig.maxCacheSize * 0.8,
  timestamp: new Date().toISOString()
});