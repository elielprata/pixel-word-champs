
interface LocalWordCache {
  [key: string]: any;
}

export const localWordCacheMetrics = {
  getCacheStats(cache: LocalWordCache | null, metrics: any) {
    if (!cache) return {
      totalEntries: 0,
      totalWords: 0,
      oldestEntry: 0,
      newestEntry: 0,
      metrics: { ...metrics },
      efficiency: 0
    };
    
    const entries = Object.values(cache);
    const totalWords = entries.reduce((sum, entry) => sum + entry.words.length, 0);
    const timestamps = entries.map(entry => entry.timestamp);
    
    const totalRequests = metrics.hits + metrics.misses;
    const efficiency = totalRequests > 0 ? (metrics.hits / totalRequests) * 100 : 0;
    
    return {
      totalEntries: entries.length,
      totalWords,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0,
      metrics: { ...metrics },
      efficiency: Math.round(efficiency)
    };
  },

  getDetailedMetrics(cache: LocalWordCache | null, metrics: any, MAX_CACHE_ENTRIES: number) {
    const stats = this.getCacheStats(cache, metrics);
    
    return {
      ...stats,
      performance: {
        hitRate: stats.efficiency,
        averageWordsPerEntry: stats.totalEntries > 0 ? 
          Math.round(stats.totalWords / stats.totalEntries) : 0,
        cacheUtilization: Math.round((stats.totalEntries / MAX_CACHE_ENTRIES) * 100)
      },
      health: stats.efficiency > 80 ? 'excellent' : 
              stats.efficiency > 60 ? 'good' : 
              stats.efficiency > 40 ? 'poor' : 'critical'
    };
  }
};
