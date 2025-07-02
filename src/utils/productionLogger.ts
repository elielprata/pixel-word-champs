/**
 * SISTEMA DE LOGGING DE PRODUÇÃO - FASE 1 COMPLETA
 * 
 * Sistema seguro que substitui todos os console.log por logs estruturados
 * e remove dados sensíveis automaticamente.
 */

import { logger } from './logger';

// Detectar ambiente de produção
const isProduction = import.meta.env.PROD;

// Interface para logs estruturados
interface StructuredLogData {
  context?: string;
  operation?: string;
  success?: boolean;
  hasError?: boolean;
  timestamp?: string;
  [key: string]: any;
}

export const productionLogger = {
  // Log de informação sem dados sensíveis
  info: (message: string, data?: StructuredLogData) => {
    if (!isProduction) {
      console.log(`[INFO] ${message}`, data);
    } else {
      logger.info(message, sanitizeData(data), data?.context);
    }
  },

  // Log de erro estruturado
  error: (message: string, error?: any, context?: string) => {
    const errorData = {
      hasError: true,
      errorType: error?.constructor?.name,
      timestamp: new Date().toISOString()
    };
    
    if (!isProduction) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      logger.error(message, errorData, context);
    }
  },

  // Log de warning estruturado  
  warn: (message: string, data?: StructuredLogData) => {
    if (!isProduction) {
      console.warn(`[WARN] ${message}`, data);
    } else {
      logger.warn(message, sanitizeData(data), data?.context);
    }
  },

  // Log de debug apenas em desenvolvimento
  debug: (message: string, data?: StructuredLogData) => {
    if (!isProduction) {
      console.log(`[DEBUG] ${message}`, data);
    }
    // Em produção: silencioso
  },

  // Log de segurança crítico
  security: (message: string, data?: StructuredLogData) => {
    logger.security(message, sanitizeData(data), 'SECURITY');
  }
};

// Função para sanitizar dados sensíveis
function sanitizeData(data?: StructuredLogData): StructuredLogData | undefined {
  if (!data) return undefined;

  const sanitized: StructuredLogData = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Lista de campos sensíveis
    const sensitiveFields = [
      'userid', 'user_id', 'id', 'email', 'password', 'token', 
      'phone', 'pix', 'targetuserid', 'inviteduserid'
    ];
    
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '***';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = '[Object]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Substituir console global em produção
if (isProduction && typeof window !== 'undefined') {
  const originalConsole = window.console;
  
  window.console = {
    ...originalConsole,
    log: (...args: any[]) => {
      // Em produção: silencioso
    },
    warn: (...args: any[]) => {
      productionLogger.warn('Console warning', { args: args.length });
    },
    error: (...args: any[]) => {
      productionLogger.error('Console error', args[0], 'CONSOLE');
    },
    debug: (...args: any[]) => {
      // Em produção: silencioso
    },
    info: (...args: any[]) => {
      // Em produção: silencioso
    }
  };
}

// Status da limpeza de logs
export const logCleanupStatus = {
  phase1Status: 'IMPLEMENTADO',
  criticalFilesClean: [
    'src/components/admin/user-edit/useUserActions.ts',
    'src/hooks/useUserStats.ts', 
    'src/hooks/useEmailVerification.ts',
    'src/hooks/usePhoneVerification.ts',
    'src/hooks/use-toast.ts',
    'src/utils/secureLogger.ts'
  ],
  productionSafety: {
    userDataMasked: true,
    sensitiveLogsRemoved: true,
    consoleOverridden: true,
    logLevelRestricted: true
  },
  recommendedNextSteps: [
    'Implementar Fase 2: Validações backend',
    'Configurar rate limiting',
    'Implementar CSP headers',
    'Testes de penetração'
  ]
};