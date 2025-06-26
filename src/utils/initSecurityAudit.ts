
import { logger } from './logger';
import { securityAuditReporter } from './securityAuditReport';

export const initializeSecurityAudit = async () => {
  try {
    logger.security('Iniciando sistema final de auditoria de segurança', undefined, 'SECURITY_AUDIT_INIT');
    
    // Gerar relatório completo final
    const report = await securityAuditReporter.generateFullReport();
    
    // Imprimir relatório no console (apenas em desenvolvimento)
    if (import.meta.env.DEV) {
      const reportText = securityAuditReporter.printReport(report);
      logger.info('Relatório Final de Auditoria Completo', { 
        reportPreview: reportText.substring(0, 500) + '...',
        fullReport: reportText 
      }, 'SECURITY_AUDIT_INIT');
    }
    
    logger.production('Sistema final de auditoria inicializado com sucesso', {
      status: report.status,
      score: report.securityMetrics.securityScore,
      migrationPhases: 5,
      readyForProduction: report.status === 'PASSED'
    }, 'SECURITY_AUDIT_INIT');
    
    // Log de conclusão da migração
    if (report.securityMetrics.securityScore >= 99) {
      logger.security('🎉 MIGRAÇÃO DE LOGGING CONCLUÍDA COM SUCESSO! Sistema pronto para produção.', {
        finalScore: report.securityMetrics.securityScore,
        totalFilesSecured: report.securityMetrics.secureFiles,
        migrationStatus: 'COMPLETE'
      }, 'SECURITY_AUDIT_INIT');
    }
    
    return report;
    
  } catch (error: any) {
    logger.error('Erro ao inicializar auditoria final de segurança', {
      error: error.message,
      stack: error.stack
    }, 'SECURITY_AUDIT_INIT');
    
    throw error;
  }
};

// Auto-inicializar em desenvolvimento
if (import.meta.env.DEV) {
  initializeSecurityAudit().catch(error => {
    logger.error('Falha na inicialização da auditoria final', { error: error.message }, 'SECURITY_AUDIT_INIT');
  });
}
