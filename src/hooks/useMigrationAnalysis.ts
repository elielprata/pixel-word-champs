
import { useState, useCallback } from 'react';
import { migrationImpactAnalysisService } from '@/services/migrationImpactAnalysis';
import { useToast } from "@/hooks/use-toast";
import { secureLogger } from '@/utils/secureLogger';

interface DependencyAnalysis {
  totalDailyCompetitions: number;
  dailyCompetitionsWithWeeklyLink: number;
  activeWeeklyTournaments: number;
  orphanedDailyCompetitions: number;
  weeklyRankingUsers: number;
  completedSessionsWithoutCompetition: number;
  totalCompletedSessions: number;
  systemHealthStatus: 'safe' | 'warning' | 'critical';
  migrationRisks: string[];
  recommendations: string[];
}

export const useMigrationAnalysis = () => {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<DependencyAnalysis | null>(null);
  const [migrationPlan, setMigrationPlan] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      secureLogger.info('Iniciando análise de migração via hook', undefined, 'MIGRATION_HOOK');
      
      const [analysisResult, planResult] = await Promise.all([
        migrationImpactAnalysisService.performFullSystemAnalysis(),
        migrationImpactAnalysisService.generateMigrationPlan()
      ]);
      
      setAnalysis(analysisResult);
      setMigrationPlan(planResult);
      
      secureLogger.info('Análise de migração concluída', { 
        status: analysisResult.systemHealthStatus,
        risks: analysisResult.migrationRisks.length 
      }, 'MIGRATION_HOOK');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      
      secureLogger.error('Erro na análise de migração', { error: errorMessage }, 'MIGRATION_HOOK');
      
      toast({
        title: "Erro na Análise",
        description: "Falha ao analisar impacto da migração",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const isSafeToMigrate = useCallback(() => {
    if (!analysis) return false;
    return analysis.systemHealthStatus === 'safe';
  }, [analysis]);

  const getMigrationBlockers = useCallback(() => {
    if (!analysis) return [];
    
    const blockers: string[] = [];
    
    if (analysis.activeWeeklyTournaments > 0) {
      blockers.push(`${analysis.activeWeeklyTournaments} torneios semanais ativos`);
    }
    
    if (analysis.dailyCompetitionsWithWeeklyLink > 0) {
      blockers.push(`${analysis.dailyCompetitionsWithWeeklyLink} competições diárias vinculadas`);
    }
    
    return blockers;
  }, [analysis]);

  const getOrphanedSessionsPercentage = useCallback(() => {
    if (!analysis || analysis.totalCompletedSessions === 0) return 0;
    return (analysis.completedSessionsWithoutCompetition / analysis.totalCompletedSessions) * 100;
  }, [analysis]);

  return {
    analysis,
    migrationPlan,
    isLoading,
    error,
    loadAnalysis,
    isSafeToMigrate,
    getMigrationBlockers,
    getOrphanedSessionsPercentage
  };
};
