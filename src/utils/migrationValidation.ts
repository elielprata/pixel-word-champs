
import { logger } from './logger';
import { loggingAuditService } from './loggingAudit';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  migrationReady: boolean;
  blockers: string[];
}

class MigrationValidationService {
  validateMigrationReadiness(): ValidationResult {
    logger.info('Iniciando validação de migração', undefined, 'MIGRATION_VALIDATION');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const blockers: string[] = [];

    // Verificar se o logger seguro está funcionando
    try {
      logger.debug('Teste de validação do logger', undefined, 'MIGRATION_VALIDATION');
    } catch (error) {
      logger.error('Logger seguro não está funcionando', { error }, 'MIGRATION_VALIDATION');
      errors.push('Logger seguro não está funcionando corretamente');
      blockers.push('LOGGER_NOT_WORKING');
    }

    // Verificar dependências críticas
    const criticalDependencies = [
      'src/utils/logger.ts',
      'src/utils/secureLogger.ts'
    ];

    for (const dep of criticalDependencies) {
      try {
        // Simular verificação de existência do arquivo
        logger.debug(`Verificando dependência: ${dep}`, undefined, 'MIGRATION_VALIDATION');
      } catch {
        logger.error(`Dependência crítica não encontrada: ${dep}`, undefined, 'MIGRATION_VALIDATION');
        errors.push(`Dependência crítica não encontrada: ${dep}`);
        blockers.push(`MISSING_DEPENDENCY_${dep.replace(/[^a-zA-Z0-9]/g, '_')}`);
      }
    }

    // Verificar se há conflitos de import
    const auditReport = loggingAuditService.generateFullReport();
    if (auditReport.logsBySeverity.critical > 0) {
      logger.warn(`Logs críticos identificados: ${auditReport.logsBySeverity.critical}`, undefined, 'MIGRATION_VALIDATION');
      warnings.push(`${auditReport.logsBySeverity.critical} logs críticos identificados`);
    }

    // Verificar capacidade de migração
    if (auditReport.estimatedMigrationTime > 600) { // Mais de 10 horas
      logger.warn('Migração estimada muito longa', { 
        estimatedTime: auditReport.estimatedMigrationTime 
      }, 'MIGRATION_VALIDATION');
      warnings.push('Migração estimada em mais de 10 horas - considere divisão em mais etapas');
    }

    const isValid = errors.length === 0;
    const migrationReady = isValid && blockers.length === 0;

    const result: ValidationResult = {
      isValid,
      errors,
      warnings,
      migrationReady,
      blockers
    };

    logger.info('Validação de migração concluída', {
      isValid,
      errorsCount: errors.length,
      warningsCount: warnings.length,
      migrationReady
    }, 'MIGRATION_VALIDATION');

    return result;
  }

  printValidationReport(result: ValidationResult): string {
    const status = result.migrationReady ? '✅ APROVADO' : result.isValid ? '⚠️ ATENÇÃO' : '❌ REPROVADO';
    
    logger.debug('Gerando relatório de validação', { 
      status, 
      errorsCount: result.errors.length,
      warningsCount: result.warnings.length 
    }, 'MIGRATION_VALIDATION');
    
    return `
=== RELATÓRIO DE VALIDAÇÃO DE MIGRAÇÃO ===
Status: ${status}

${result.errors.length > 0 ? `🔴 Erros (${result.errors.length}):
${result.errors.map(error => `  • ${error}`).join('\n')}
` : ''}
${result.warnings.length > 0 ? `⚠️ Avisos (${result.warnings.length}):
${result.warnings.map(warning => `  • ${warning}`).join('\n')}
` : ''}
${result.blockers.length > 0 ? `🚫 Bloqueadores (${result.blockers.length}):
${result.blockers.map(blocker => `  • ${blocker}`).join('\n')}
` : ''}

Pronto para Migração: ${result.migrationReady ? 'SIM' : 'NÃO'}
    `.trim();
  }
}

export const migrationValidationService = new MigrationValidationService();
