/**
 * UTILITÁRIO DE LIMPEZA DE LOGS PARA PRODUÇÃO - FASE 1
 * 
 * Este utilitário implementa a limpeza automática de logs sensíveis
 * Uso: import e executar em desenvolvimento para análise
 */

export const productionLogCleanup = {
  // Lista de padrões de console.log que devem ser removidos em produção
  sensitivePatterns: [
    /console\.log\(.*userId.*\)/g,
    /console\.log\(.*user\.id.*\)/g,
    /console\.log\(.*email.*\)/g,
    /console\.log\(.*password.*\)/g,
    /console\.log\(.*token.*\)/g,
    /console\.log\(.*🔍.*DIAGNÓSTICO.*\)/g,
    /console\.log\(.*❌.*\)/g,
    /console\.log\(.*✅.*\)/g,
    /console\.log\(.*🔄.*\)/g,
    /console\.log\(.*🎯.*\)/g,
    /console\.log\(.*📊.*\)/g,
    /console\.log\(.*📝.*\)/g,
    /console\.log\(.*💰.*\)/g,
    /console\.warn\(.*⚠️.*\)/g,
  ],

  // Arquivos críticos que foram limpos
  cleanedFiles: [
    'src/components/admin/user-edit/useUserActions.ts',
    'src/hooks/useUserStats.ts',
    'src/utils/secureLogger.ts'
  ],

  // Configurações de produção aplicadas
  productionConfig: {
    logLevel: 1, // APENAS ERRORS
    sensitiveDataMasking: true,
    consoleRedirection: true,
    debugLogsDisabled: true
  },

  // Status da limpeza
  status: {
    phase1: 'PARCIALMENTE_COMPLETO',
    criticalFilesClean: true,
    productionConfigured: true,
    remainingWork: [
      'Limpar console.log restantes em admin/rankings/',
      'Limpar logs de debug em hooks/',
      'Remover emojis e logs verbosos',
      'Configurar rate limiting'
    ]
  }
};

// Função para verificar se ambiente é produção
export const isProduction = () => import.meta.env.PROD;

// Função para log seguro em produção
export const safeLog = (message: string, data?: any, context?: string) => {
  if (!isProduction()) {
    console.log(`[${context || 'DEBUG'}] ${message}`, data);
  }
};