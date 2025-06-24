
import { useState, useEffect } from 'react';
import { scoringSyncService } from '@/services/scoringSyncService';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';

interface ScoringValidationResult {
  users_with_completed_sessions: number;
  users_with_scores: number;
  users_in_current_ranking: number;
  orphaned_sessions: number;
  current_week_start: string;
  validation_passed: boolean;
  issues: string[];
}

interface OrphanedScoresFix {
  fixed_users_count: number;
  corrections: Array<{
    user_id: string;
    old_score: number;
    new_score: number;
    difference: number;
  }>;
  ranking_updated: boolean;
}

export const useScoringSyncManagement = () => {
  const { toast } = useToast();
  const [validationResult, setValidationResult] = useState<ScoringValidationResult | null>(null);
  const [fixResult, setFixResult] = useState<OrphanedScoresFix | null>(null);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const validateIntegrity = async () => {
    setIsValidating(true);
    try {
      const result = await scoringSyncService.validateScoringIntegrity();
      setValidationResult(result);
      
      if (result.validation_passed) {
        toast({
          title: "✅ Validação Concluída",
          description: "Sistema de pontuação está íntegro!",
        });
      } else {
        toast({
          title: "⚠️ Problemas Encontrados",
          description: `${result.issues.length} problema(s) detectado(s)`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na Validação",
        description: "Erro ao validar integridade do sistema",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const fixOrphanedScores = async () => {
    setIsFixing(true);
    try {
      const result = await scoringSyncService.fixOrphanedScores();
      setFixResult(result);
      
      if (result.fixed_users_count > 0) {
        toast({
          title: "✅ Correções Aplicadas",
          description: `${result.fixed_users_count} usuário(s) corrigido(s)`,
        });
        // Re-validar após correção
        await validateIntegrity();
      } else {
        toast({
          title: "ℹ️ Nenhuma Correção Necessária",
          description: "Todas as pontuações já estão sincronizadas",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na Correção",
        description: "Erro ao corrigir pontuações órfãs",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  const syncScores = async () => {
    setIsLoading(true);
    try {
      await scoringSyncService.syncUserScoresToWeeklyRanking();
      toast({
        title: "✅ Sincronização Concluída",
        description: "Pontuações sincronizadas com ranking semanal",
      });
      // Re-validar após sincronização
      await validateIntegrity();
    } catch (error) {
      toast({
        title: "Erro na Sincronização",
        description: "Erro ao sincronizar pontuações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAutoUpdateStatus = async () => {
    try {
      const status = await scoringSyncService.getAutoUpdateStatus();
      setAutoUpdateEnabled(status);
    } catch (error) {
      logger.error('Erro ao carregar status de auto-update', { error }, 'SCORING_SYNC_HOOK');
    }
  };

  const toggleAutoUpdate = async (enabled: boolean) => {
    try {
      await scoringSyncService.setAutoUpdateStatus(enabled);
      setAutoUpdateEnabled(enabled);
      toast({
        title: enabled ? "Auto-Update Ativado" : "Auto-Update Desativado",
        description: enabled 
          ? "Ranking será atualizado automaticamente" 
          : "Atualizações manuais necessárias",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar configuração de auto-update",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadAutoUpdateStatus();
    validateIntegrity(); // Validação inicial
  }, []);

  return {
    validationResult,
    fixResult,
    autoUpdateEnabled,
    isLoading,
    isValidating,
    isFixing,
    validateIntegrity,
    fixOrphanedScores,
    syncScores,
    toggleAutoUpdate
  };
};
