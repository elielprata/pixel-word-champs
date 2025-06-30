
import { useState, useEffect, useCallback } from 'react';
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

  // 🎯 CORREÇÃO: Função para refrescar status
  const refreshStatus = useCallback(async () => {
    if (!user || !competitionId) {
      setStatus({ status: 'not_started', loading: false });
      return;
    }

    try {
      logger.debug('🔍 Verificando status da competição', { 
        competitionId, 
        userId: user.id 
      }, 'COMPETITION_STATUS');

      const progress = await challengeProgressService.getProgress(user.id, competitionId);
      
      if (!progress) {
        // Nenhum progresso = não iniciado
        logger.debug('📝 Nenhum progresso encontrado - não iniciado', { 
          competitionId, 
          userId: user.id 
        }, 'COMPETITION_STATUS');
        setStatus({ status: 'not_started', loading: false });
      } else if (progress.is_completed) {
        // Completado
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
        // Em progresso
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
    }
  }, [competitionId, user]);

  // 🎯 CORREÇÃO: Efeito principal para carregar status
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // 🎯 NOVA FUNCIONALIDADE: Listener para mudanças no progresso
  useEffect(() => {
    const handleProgressUpdate = () => {
      logger.debug('🔄 Atualizando status após mudança no progresso', { 
        competitionId 
      }, 'COMPETITION_STATUS');
      refreshStatus();
    };

    // Escutar eventos customizados de progresso
    window.addEventListener('challenge-progress-updated', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('challenge-progress-updated', handleProgressUpdate);
    };
  }, [refreshStatus, competitionId]);

  return status;
};
