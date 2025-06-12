
import { secureLogger } from './secureLogger';

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const logger = {
  log: (message: string, data?: any, context?: string) => {
    secureLogger.info(message, data, context);
  },
  
  error: (message: string, data?: any, context?: string) => {
    secureLogger.error(message, data, context);
  },
  
  warn: (message: string, data?: any, context?: string) => {
    secureLogger.warn(message, data, context);
  },
  
  info: (message: string, data?: any, context?: string) => {
    secureLogger.info(message, data, context);
  },
  
  debug: (message: string, data?: any, context?: string) => {
    if (isDevelopment) {
      secureLogger.debug(message, data, context);
    }
  },
  
  production: (message: string, data?: any, context?: string) => {
    secureLogger.production(message, data, context);
  }
};

// Utilitário para logs estruturados em produção
export const structuredLog = (level: 'info' | 'warn' | 'error', message: string, data?: any, context?: string) => {
  switch (level) {
    case 'error':
      secureLogger.error(message, data, context);
      break;
    case 'warn':
      secureLogger.warn(message, data, context);
      break;
    case 'info':
      secureLogger.info(message, data, context);
      break;
  }
};
