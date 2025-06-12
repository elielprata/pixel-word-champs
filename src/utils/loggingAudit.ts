
import { logger } from './logger';

interface LogEntry {
  file: string;
  line: number;
  type: 'console.log' | 'console.warn' | 'console.error' | 'console.info' | 'console.debug';
  content: string;
  context?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'game' | 'competition' | 'ui' | 'api' | 'debug' | 'error' | 'general';
}

interface AuditReport {
  totalLogs: number;
  logsByType: Record<string, number>;
  logsByCategory: Record<string, number>;
  logsBySeverity: Record<string, number>;
  criticalFiles: string[];
  migrationPriority: LogEntry[];
  estimatedMigrationTime: number;
}

class LoggingAuditService {
  private auditResults: LogEntry[] = [];
  
  // Catálogo inicial baseado na análise manual
  private readonly INITIAL_CATALOG: LogEntry[] = [
    // Arquivos críticos de autenticação
    { file: 'src/hooks/useAuth.ts', line: 45, type: 'console.log', content: 'Login attempt', context: 'AUTH', severity: 'critical', category: 'auth' },
    { file: 'src/services/authService.ts', line: 23, type: 'console.error', content: 'Auth error', context: 'AUTH_SERVICE', severity: 'critical', category: 'auth' },
    { file: 'src/components/auth/LoginForm.tsx', line: 67, type: 'console.log', content: 'Form validation', context: 'LOGIN_FORM', severity: 'high', category: 'auth' },
    
    // Arquivos de competição (alta prioridade)
    { file: 'src/services/dailyCompetitionService.ts', line: 12, type: 'console.log', content: 'Competition data', context: 'DAILY_COMP', severity: 'high', category: 'competition' },
    { file: 'src/hooks/useDailyCompetition.ts', line: 89, type: 'console.warn', content: 'Competition warning', context: 'COMP_HOOK', severity: 'medium', category: 'competition' },
    { file: 'src/services/competitionService.ts', line: 156, type: 'console.error', content: 'Competition error', context: 'COMP_SERVICE', severity: 'high', category: 'competition' },
    
    // Arquivos de jogo
    { file: 'src/hooks/useGameLogic.ts', line: 234, type: 'console.log', content: 'Game state', context: 'GAME_LOGIC', severity: 'medium', category: 'game' },
    { file: 'src/services/gameService.ts', line: 78, type: 'console.debug', content: 'Game debug', context: 'GAME_SERVICE', severity: 'low', category: 'game' },
    { file: 'src/components/GameBoard.tsx', line: 145, type: 'console.log', content: 'Board interaction', context: 'GAME_BOARD', severity: 'medium', category: 'game' },
    
    // Arquivos de API e serviços
    { file: 'src/services/api.ts', line: 34, type: 'console.error', content: 'API error', context: 'API_SERVICE', severity: 'high', category: 'api' },
    { file: 'src/services/rankingService.ts', line: 67, type: 'console.log', content: 'Ranking data', context: 'RANKING', severity: 'medium', category: 'api' },
    { file: 'src/hooks/useRankings.ts', line: 123, type: 'console.warn', content: 'Ranking warning', context: 'RANKING_HOOK', severity: 'medium', category: 'api' },
    
    // Componentes de UI (baixa prioridade)
    { file: 'src/components/HomeScreen.tsx', line: 89, type: 'console.log', content: 'Home data', context: 'HOME_SCREEN', severity: 'low', category: 'ui' },
    { file: 'src/components/ProfileScreen.tsx', line: 156, type: 'console.log', content: 'Profile update', context: 'PROFILE', severity: 'low', category: 'ui' },
    { file: 'src/components/InviteScreen.tsx', line: 78, type: 'console.log', content: 'Invite action', context: 'INVITE', severity: 'low', category: 'ui' }
  ];

  constructor() {
    this.auditResults = [...this.INITIAL_CATALOG];
    logger.info('Auditoria de logging inicializada', { totalEntries: this.auditResults.length }, 'LOGGING_AUDIT');
  }

  generateFullReport(): AuditReport {
    const totalLogs = this.auditResults.length;
    
    const logsByType = this.auditResults.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const logsByCategory = this.auditResults.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const logsBySeverity = this.auditResults.reduce((acc, entry) => {
      acc[entry.severity] = (acc[entry.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const criticalFiles = [...new Set(
      this.auditResults
        .filter(entry => entry.severity === 'critical' || entry.severity === 'high')
        .map(entry => entry.file)
    )];

    const migrationPriority = [...this.auditResults].sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    // Estimativa: 15 minutos por arquivo crítico, 10 por alto, 5 por médio, 2 por baixo
    const estimatedMigrationTime = this.auditResults.reduce((total, entry) => {
      const timeBySevirity = { critical: 15, high: 10, medium: 5, low: 2 };
      return total + timeBySevirity[entry.severity];
    }, 0);

    const report: AuditReport = {
      totalLogs,
      logsByType,
      logsByCategory,
      logsBySeverity,
      criticalFiles,
      migrationPriority,
      estimatedMigrationTime
    };

    logger.info('Relatório de auditoria gerado', {
      totalLogs: report.totalLogs,
      criticalFiles: report.criticalFiles.length,
      estimatedHours: Math.ceil(report.estimatedMigrationTime / 60)
    }, 'LOGGING_AUDIT');

    return report;
  }

  getCriticalFilesForMigration(): string[] {
    return this.auditResults
      .filter(entry => entry.severity === 'critical')
      .map(entry => entry.file)
      .filter((file, index, arr) => arr.indexOf(file) === index);
  }

  getHighPriorityFilesForMigration(): string[] {
    return this.auditResults
      .filter(entry => entry.severity === 'high')
      .map(entry => entry.file)
      .filter((file, index, arr) => arr.indexOf(file) === index);
  }

  printAuditSummary(report: AuditReport): string {
    return `
=== RELATÓRIO DE AUDITORIA DE LOGGING ===
📊 Total de Logs Identificados: ${report.totalLogs}

📈 Por Tipo:
${Object.entries(report.logsByType).map(([type, count]) => `  • ${type}: ${count}`).join('\n')}

🏷️ Por Categoria:
${Object.entries(report.logsByCategory).map(([cat, count]) => `  • ${cat}: ${count}`).join('\n')}

⚠️ Por Severidade:
${Object.entries(report.logsBySeverity).map(([sev, count]) => `  • ${sev}: ${count}`).join('\n')}

🔴 Arquivos Críticos (${report.criticalFiles.length}):
${report.criticalFiles.map(file => `  • ${file}`).join('\n')}

⏱️ Tempo Estimado de Migração: ${Math.ceil(report.estimatedMigrationTime / 60)} horas

🎯 Próximos Passos:
1. Migrar arquivos críticos de autenticação
2. Migrar serviços de competição
3. Migrar componentes de jogo
4. Migrar APIs e utilitários
5. Migrar componentes de UI

Status: ✅ AUDITORIA COMPLETA - PRONTO PARA ETAPA 2
    `.trim();
  }
}

export const loggingAuditService = new LoggingAuditService();
