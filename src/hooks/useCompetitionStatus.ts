
import { useState, useEffect, useCallback, useRef } from 'react';
import { challengeProgressService } from '@/services/challengeProgressService';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

interface CompetitionStatus {
  status: 'not_started' | 'in_progress' | 'completed';
  currentLevel?: number;
  totalScore?: number;
  loading: boolean;
}

export const useCompetitionStatus = (competitionId: string): CompetitionStatus => {
  const { user } = useAuth();
  const [status, setStatus] = useState<CompetitionStatus>({
    status: 'not_started',
    loading: true
  });
  
  // 🔧 CORREÇÃO: Usar refs para evitar loops infinitos
  const lastCompetitionId = useRef<string>('');
  const lastUserId = useRef<string>('');
  const isRefreshing = useRef<boolean>(false);

  // 🔧 CORREÇÃO: Função para refrescar status com proteção contra loops
  const refreshStatus = useCallback(async () => {
    // Evitar múltiplas execuções simultâneas
    if (isRefreshing.current) {
      logger.debug('⚠️ Refresh já em andamento, ignorando', { competitionId }, 'COMPETITION_STATUS');
      return;
    }

    if (!user || !competitionId) {
      setStatus({ status: 'not_started', loading: false });
      return;
    }

    // Verificar se realmente precisa fazer refresh
    if (lastCompetitionId.current === competitionId && lastUserId.current === user.id) {
      logger.debug('🔄 Dados não mudaram, skip refresh', { 
        competitionId, 
        userId: user.id 
      }, 'COMPETITION_STATUS');
      return;
    }

    isRefreshing.current = true;
    lastCompetitionId.current = competitionId;
    lastUserId.current = user.id;

    try {
      logger.debug('🔍 Verificando status da competição', { 
        competitionId, 
        userId: user.id 
      }, 'COMPETITION_STATUS');

      const progress = await challengeProgressService.getProgress(user.id, competitionId);
      
      if (!progress) {
        logger.debug('📝 Nenhum progresso encontrado - não iniciado', { 
          competitionId, 
          userId: user.id 
        }, 'COMPETITION_STATUS');
        setStatus({ status: 'not_started', loading: false });
      } else if (progress.is_completed) {
        logger.debug('🏆 Competição completada', { 
          competitionId, 
          userId: user.id,
          totalScore: progress.total_score
        }, 'COMPETITION_STATUS');
        setStatus({ 
          status: 'completed', 
          currentLevel: progress.current_level,
          totalScore: progress.total_score,
          loading: false 
        });
      } else {
        logger.debug('🎯 Competição em progresso', { 
          competitionId, 
          userId: user.id,
          currentLevel: progress.current_level,
          totalScore: progress.total_score
        }, 'COMPETITION_STATUS');
        setStatus({ 
          status: 'in_progress', 
          currentLevel: progress.current_level,
          totalScore: progress.total_score,
          loading: false 
        });
      }
    } catch (error) {
      logger.error('❌ Erro ao verificar status da competição', { 
        error: error instanceof Error ? {
          name: error.name,
          message: error.message
        } : error,
        competitionId, 
        userId: user.id 
      }, 'COMPETITION_STATUS');
      
      // Em caso de erro, assumir não iniciado
      setStatus({ status: 'not_started', loading: false });
    } finally {
      isRefreshing.current = false;
    }
  }, [competitionId, user]);

  // 🔧 CORREÇÃO: Efeito principal controlado
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // 🔧 CORREÇÃO: Listener para mudanças no progresso com throttle
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleProgressUpdate = (event: CustomEvent) => {
      const { competitionId: updatedCompetitionId } = event.detail;
      
      if (updatedCompetitionId === competitionId) {
        logger.debug('🔄 Atualizando status após mudança no progresso', { 
          competitionId 
        }, 'COMPETITION_STATUS');
        
        // Throttle para evitar múltiplas atualizações rápidas
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          refreshStatus();
        }, 500);
      }
    };

    // Escutar eventos customizados de progresso
    window.addEventListener('challenge-progress-updated', handleProgressUpdate as EventListener);
    
    return () => {
      window.removeEventListener('challenge-progress-updated', handleProgressUpdate as EventListener);
      clearTimeout(timeoutId);
    };
  }, [refreshStatus, competitionId]);

  return status;
};
