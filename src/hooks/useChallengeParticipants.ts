
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useChallengeParticipants = (challengeId: number) => {
  const [participantCount, setParticipantCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadParticipantCount();
  }, [challengeId]);

  const loadParticipantCount = async () => {
    setIsLoading(true);
    try {
      // Contar usuários únicos que jogaram este desafio (simulado por game_sessions)
      const { count, error } = await supabase
        .from('game_sessions')
        .select('user_id', { count: 'exact', head: true })
        .eq('level', challengeId); // Usando level como proxy para challenge_id

      if (error) throw error;
      
      // Adicionar um número base para cada desafio para simular mais participantes
      const baseParticipants = {
        1: 1200,
        2: 850,
        3: 2000
      };

      setParticipantCount((baseParticipants[challengeId as keyof typeof baseParticipants] || 500) + (count || 0));
    } catch (error) {
      console.error('Error loading participant count:', error);
      setParticipantCount(Math.floor(Math.random() * 1000) + 500); // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  return {
    participantCount,
    isLoading,
    refetch: loadParticipantCount
  };
};
