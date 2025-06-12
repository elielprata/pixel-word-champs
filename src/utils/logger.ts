
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Manter erros em produção para debugging crítico
    console.error(...args);
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    // Debug apenas em desenvolvimento
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },
  production: (...args: any[]) => {
    // Logs críticos que devem aparecer mesmo em produção
    if (isProduction) {
      console.log('[PROD]', ...args);
    }
  }
};

// Utilitário para logs estruturados em produção
export const structuredLog = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  if (isProduction) {
    console[level](JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    }));
  } else {
    console[level](`[${level.toUpperCase()}] ${message}`, data || '');
  }
};
