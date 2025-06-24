
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWeeklyCompetitionAutoParticipation } from './useWeeklyCompetitionAutoParticipation';
import { weeklyPositionService } from '@/services/weeklyPositionService';
import { logger } from '@/utils/logger';

// HOOK DEPRECIADO - USE useGameSessionManager
// Este hook está mantido apenas para compatibilidade com código existente
// A nova lógica está em useGameSessionManager que só registra sessões COMPLETADAS

export const useGameSessionWithWeeklyUpdates = () => {
  const { user } = useAuth();
  const { activeWeeklyCompetition, updateWeeklyScore } = useWeeklyCompetitionAutoParticipation();
  const [currentSession, setCurrentSession] = useState<any>(null);

  logger.warn('⚠️ useGameSessionWithWeeklyUpdates está DEPRECIADO - use useGameSessionManager');

  const createGameSession = async (boardData: any, level: number) => {
    logger.warn('⚠️ createGameSession depreciado - sessões agora são criadas apenas quando completadas');
    
    // Retornar sessão fake para compatibilidade
    const fakeSession = {
      id: `temp-${Date.now()}`,
      user_id: user?.id,
      level,
      board: boardData,
      total_score: 0,
      is_completed: false
    };

    setCurrentSession(fakeSession);
    return fakeSession;
  };

  const updateGameSession = async (sessionId: string, updates: any) => {
    logger.warn('⚠️ updateGameSession depreciado - use useGameSessionManager');
    
    if (currentSession && currentSession.id === sessionId) {
      setCurrentSession({ ...currentSession, ...updates });
    }

    return currentSession;
  };

  return {
    currentSession,
    activeWeeklyCompetition,
    createGameSession,
    updateGameSession
  };
};
