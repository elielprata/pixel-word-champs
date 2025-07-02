/**
 * SISTEMA DE CACHE SEGURO PARA PRODUÇÃO
 * 
 * Cache inteligente com invalidação automática e proteção contra ataques
 */

import { productionLogger } from '@/utils/productionLogger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
  secure: boolean;
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  secureMode: boolean;
  autoCleanup: boolean;
  cleanupInterval: number;
}

class SecureCache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: import.meta.env.PROD ? 5 * 60 * 1000 : 30 * 1000, // 5min prod, 30s dev
      maxSize: import.meta.env.PROD ? 100 : 50,
      secureMode: import.meta.env.PROD,
      autoCleanup: true,
      cleanupInterval: import.meta.env.PROD ? 10 * 60 * 1000 : 60 * 1000, // 10min prod, 1min dev
      ...config
    };

    if (this.config.autoCleanup) {
      this.startAutoCleanup();
    }

    productionLogger.info('Cache seguro inicializado', {
      ttl: this.config.defaultTTL,
      maxSize: this.config.maxSize,
      secureMode: this.config.secureMode
    });
  }

  private generateSecureKey(key: string): string {
    if (!this.config.secureMode) return key;

    // Em produção, hash a chave para evitar vazamento de informações
    const hashedKey = btoa(key).replace(/[^a-zA-Z0-9]/g, '');
    return `sec_${hashedKey.substring(0, 32)}`;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  private shouldEvict(): boolean {
    return this.cache.size >= this.config.maxSize;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      productionLogger.debug('Entrada LRU removida do cache', { evictedKey: 'masked' });
    }
  }

  private cleanup(): void {
    const beforeSize = this.cache.size;
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      productionLogger.debug('Limpeza automática do cache', {
        removedEntries: cleanedCount,
        beforeSize,
        afterSize: this.cache.size
      });
    }
  }

  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  set<T>(key: string, data: T, ttl?: number, options: { secure?: boolean } = {}): void {
    try {
      const secureKey = this.generateSecureKey(key);
      const now = Date.now();
      const expiration = now + (ttl || this.config.defaultTTL);

      // Verificar se precisa fazer eviction
      if (this.shouldEvict()) {
        this.evictLRU();
      }

      // Validar dados sensíveis em modo seguro
      if (this.config.secureMode && options.secure !== false) {
        const dataStr = JSON.stringify(data);
        const sensitivePatterns = [
          /password/i,
          /token/i,
          /secret/i,
          /key/i,
          /auth/i,
          /userid/i,
          /email/i
        ];

        const hasSensitiveData = sensitivePatterns.some(pattern => pattern.test(dataStr));
        if (hasSensitiveData) {
          productionLogger.warn('Tentativa de cache de dados sensíveis bloqueada');
          return;
        }
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiresAt: expiration,
        accessCount: 0,
        lastAccessed: now,
        secure: options.secure || false
      };

      this.cache.set(secureKey, entry);

      productionLogger.debug('Entrada adicionada ao cache', {
        ttl: ttl || this.config.defaultTTL,
        cacheSize: this.cache.size
      });

    } catch (error: any) {
      productionLogger.error('Erro ao adicionar ao cache', { hasError: true });
    }
  }

  get<T>(key: string): T | null {
    try {
      const secureKey = this.generateSecureKey(key);
      const entry = this.cache.get(secureKey);

      if (!entry) {
        return null;
      }

      if (this.isExpired(entry)) {
        this.cache.delete(secureKey);
        productionLogger.debug('Entrada expirada removida do cache');
        return null;
      }

      // Atualizar estatísticas de acesso
      entry.accessCount++;
      entry.lastAccessed = Date.now();

      productionLogger.debug('Cache hit', {
        accessCount: entry.accessCount
      });

      return entry.data;

    } catch (error: any) {
      productionLogger.error('Erro ao ler do cache', { hasError: true });
      return null;
    }
  }

  delete(key: string): boolean {
    try {
      const secureKey = this.generateSecureKey(key);
      const deleted = this.cache.delete(secureKey);
      
      if (deleted) {
        productionLogger.debug('Entrada removida do cache');
      }
      
      return deleted;
    } catch (error: any) {
      productionLogger.error('Erro ao remover do cache', { hasError: true });
      return false;
    }
  }

  clear(): void {
    try {
      const size = this.cache.size;
      this.cache.clear();
      
      productionLogger.info('Cache limpo completamente', { 
        removedEntries: size 
      });
    } catch (error: any) {
      productionLogger.error('Erro ao limpar cache', { hasError: true });
    }
  }

  getStats() {
    let totalAccesses = 0;
    let expiredCount = 0;
    let secureCount = 0;

    for (const entry of this.cache.values()) {
      totalAccesses += entry.accessCount;
      if (this.isExpired(entry)) expiredCount++;
      if (entry.secure) secureCount++;
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      totalAccesses,
      expiredCount,
      secureCount,
      hitRate: totalAccesses > 0 ? (totalAccesses - expiredCount) / totalAccesses : 0,
      config: this.config
    };
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
    productionLogger.info('Cache seguro destruído');
  }
}

// Instância global do cache seguro
export const secureCache = new SecureCache();

// Cache especializado para dados de usuário
export const userCache = new SecureCache({
  defaultTTL: import.meta.env.PROD ? 2 * 60 * 1000 : 30 * 1000, // 2min prod, 30s dev
  maxSize: 50,
  secureMode: true
});

// Cache para dados de competição
export const competitionCache = new SecureCache({
  defaultTTL: import.meta.env.PROD ? 30 * 1000 : 10 * 1000, // 30s prod, 10s dev
  maxSize: 100,
  secureMode: false
});

// Cache para configurações do sistema
export const configCache = new SecureCache({
  defaultTTL: import.meta.env.PROD ? 10 * 60 * 1000 : 60 * 1000, // 10min prod, 1min dev
  maxSize: 20,
  secureMode: true
});

// Função para monitoramento do cache
export const getCacheHealth = () => ({
  secure: secureCache.getStats(),
  user: userCache.getStats(),
  competition: competitionCache.getStats(),
  config: configCache.getStats(),
  timestamp: new Date().toISOString()
});

// Limpeza de emergência
export const emergencyCleanup = () => {
  productionLogger.warn('Limpeza de emergência do cache iniciada');
  
  secureCache.clear();
  userCache.clear();
  competitionCache.clear();
  configCache.clear();
  
  productionLogger.info('Limpeza de emergência concluída');
};