
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const checkStatus = async () => {
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
          setStatus({ status: 'not_started', loading: false });
        } else if (progress.is_completed) {
          // Completado
          setStatus({ 
            status: 'completed', 
            currentLevel: progress.current_level,
            totalScore: progress.total_score,
            loading: false 
          });
        } else {
          // Em progresso
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
    };

    checkStatus();
  }, [competitionId, user]);

  return status;
};
