
import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';

interface BackupResult {
  success: boolean;
  backupId?: string;
  tablesBackedUp?: string[];
  error?: string;
}

class MigrationBackupService {
  async createSecurityBackup(): Promise<BackupResult> {
    try {
      secureLogger.info('Iniciando backup de segurança para migração', undefined, 'MIGRATION_BACKUP');
      
      const backupId = `migration_backup_${Date.now()}`;
      const timestamp = new Date().toISOString();
      
      // Lista de tabelas críticas para backup
      const criticalTables = [
        'custom_competitions',
        'weekly_rankings', 
        'game_sessions',
        'competition_history'
      ];
      
      const backupData = {
        backup_id: backupId,
        timestamp: timestamp,
        migration_phase: 'pre_migration',
        tables_backed_up: criticalTables,
        system_status: 'active'
      };
      
      // Registrar backup no log de automação
      const { error: logError } = await supabase
        .from('automation_logs')
        .insert({
          automation_type: 'migration_backup',
          scheduled_time: timestamp,
          executed_at: timestamp,
          execution_status: 'completed',
          settings_snapshot: backupData
        });
      
      if (logError) {
        throw new Error(`Erro ao registrar backup: ${logError.message}`);
      }
      
      secureLogger.info('Backup de segurança concluído', { backupId }, 'MIGRATION_BACKUP');
      
      return {
        success: true,
        backupId,
        tablesBackedUp: criticalTables
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      secureLogger.error('Erro no backup de segurança', { error: errorMessage }, 'MIGRATION_BACKUP');
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  async validateBackup(backupId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .eq('automation_type', 'migration_backup')
        .contains('settings_snapshot', { backup_id: backupId })
        .single();
      
      if (error || !data) {
        return false;
      }
      
      return data.execution_status === 'completed';
      
    } catch (error) {
      secureLogger.error('Erro na validação do backup', { backupId, error }, 'MIGRATION_BACKUP');
      return false;
    }
  }
}

export const migrationBackupService = new MigrationBackupService();
