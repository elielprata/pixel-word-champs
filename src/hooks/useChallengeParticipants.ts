
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
      // Count unique users who have progress in this challenge
      const { count, error } = await supabase
        .from('challenge_progress')
        .select('user_id', { count: 'exact', head: true })
        .eq('challenge_id', challengeId);

      if (error) throw error;
      
      console.log(`Participants for challenge ${challengeId}:`, count);
      setParticipantCount(count || 0);
    } catch (error) {
      console.error('Error loading participant count:', error);
      setParticipantCount(0);
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
