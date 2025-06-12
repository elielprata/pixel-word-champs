
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
  },

  // Método específico para auditoria de segurança
  security: (message: string, data?: any, context?: string) => {
    secureLogger.security(message, data, context);
  },

  // Método para verificar configuração do logger
  getConfig: () => {
    return secureLogger.getConfig();
  }
};

// Utilitário para logs estruturados em produção
export const structuredLog = (level: 'info' | 'warn' | 'error' | 'security', message: string, data?: any, context?: string) => {
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
    case 'security':
      secureLogger.security(message, data, context);
      break;
  }
};

// Utilitário para migração gradual de console.log para logger
export const migrateConsoleLog = (originalConsole: any) => {
  if (isProduction) {
    // Em produção, redirecionar console.log para o logger seguro
    originalConsole.log = (message: string, ...args: any[]) => {
      logger.info(message, args.length > 0 ? args : undefined, 'CONSOLE_MIGRATION');
    };
    
    originalConsole.error = (message: string, ...args: any[]) => {
      logger.error(message, args.length > 0 ? args : undefined, 'CONSOLE_MIGRATION');
    };
    
    originalConsole.warn = (message: string, ...args: any[]) => {
      logger.warn(message, args.length > 0 ? args : undefined, 'CONSOLE_MIGRATION');
    };
  }
};

// Inicializar migração em produção
if (isProduction && typeof window !== 'undefined') {
  migrateConsoleLog(console);
  logger.production('Sistema de logger inicializado em produção', undefined, 'LOGGER_INIT');
}

// Log de inicialização do sistema
logger.info('Sistema de logger inicializado', { 
  environment: isDevelopment ? 'development' : 'production',
  config: logger.getConfig() 
}, 'LOGGER_INIT');
