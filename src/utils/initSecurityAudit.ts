
import { logger } from './logger';
import { securityAuditReporter } from './securityAuditReport';
import { logAuditService } from './logAudit';

export const initializeSecurityAudit = async () => {
  try {
    logger.security('Iniciando sistema de auditoria de segurança', undefined, 'SECURITY_AUDIT_INIT');
    
    // Gerar relatório completo
    const report = await securityAuditReporter.generateFullReport();
    
    // Imprimir relatório no console (apenas em desenvolvimento)
    if (import.meta.env.DEV) {
      const reportText = securityAuditReporter.printReport(report);
      logger.info('Relatório de Auditoria Completo', { report: reportText }, 'SECURITY_AUDIT_INIT');
    }
    
    // Log de evento de segurança
    logAuditService.logSecurityEvent('SYSTEM_AUDIT_COMPLETED', {
      status: report.status,
      securityScore: report.securityMetrics.securityScore,
      phases: report.phases
    }, report.status === 'PASSED' ? 'low' : report.status === 'WARNING' ? 'medium' : 'high');
    
    logger.production('Sistema de auditoria inicializado', {
      status: report.status,
      score: report.securityMetrics.securityScore
    }, 'SECURITY_AUDIT_INIT');
    
    return report;
    
  } catch (error: any) {
    logger.error('Erro ao inicializar auditoria de segurança', {
      error: error.message
    }, 'SECURITY_AUDIT_INIT');
    
    logAuditService.logSecurityEvent('AUDIT_INITIALIZATION_FAILED', {
      error: error.message
    }, 'critical');
    
    throw error;
  }
};

// Auto-inicializar em desenvolvimento
if (import.meta.env.DEV) {
  initializeSecurityAudit().catch(error => {
    console.error('Falha na inicialização da auditoria:', error);
  });
}
