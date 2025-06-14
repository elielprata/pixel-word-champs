
import { getCacheStatus } from './cacheWarmingManagement';

// MÉTRICAS AVANÇADAS DO SISTEMA UNIFICADO
export const getUnifiedSystemMetrics = () => {
  const cacheStatus = getCacheStatus();
  
  return {
    cache: cacheStatus,
    performance: {
      uptime: Math.round(performance.now()),
      memory: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
      } : null,
      cacheEfficiency: cacheStatus.efficiency
    },
    recommendations: cacheStatus.recommendations,
    timestamp: new Date().toISOString(),
    systemVersion: '2.0.0'
  };
};
