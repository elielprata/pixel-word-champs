
import { logger } from './logger';
import { securityAuditReporter } from './securityAuditReport';
import { logAuditService } from './logAudit';

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
    
    // Log de evento de segurança final
    logAuditService.logSecurityEvent('FINAL_SYSTEM_AUDIT_COMPLETED', {
      status: report.status,
      securityScore: report.securityMetrics.securityScore,
      phases: report.phases,
      migrationComplete: true,
      totalFilesUpdated: Object.values(report.phases).reduce((sum, phase) => sum + phase.filesUpdated, 0)
    }, report.status === 'PASSED' ? 'low' : report.status === 'WARNING' ? 'medium' : 'high');
    
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
    
    logAuditService.logSecurityEvent('FINAL_AUDIT_INITIALIZATION_FAILED', {
      error: error.message,
      timestamp: new Date().toISOString()
    }, 'critical');
    
    throw error;
  }
};

// Auto-inicializar em desenvolvimento
if (import.meta.env.DEV) {
  initializeSecurityAudit().catch(error => {
    logger.error('Falha na inicialização da auditoria final', { error: error.message }, 'SECURITY_AUDIT_INIT');
  });
}
