
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Challenge {
  id: number;
  title: string;
  description: string;
  theme: string;
  color: string;
  difficulty: 'easy' | 'medium' | 'hard';
  levels: number;
  is_active: boolean;
}

interface UseChallengesOptions {
  activeOnly?: boolean;
}

export const useChallenges = (options: UseChallengesOptions = {}) => {
  const { activeOnly = true } = options;
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, [activeOnly]);

  const loadChallenges = async () => {
    try {
      let query = supabase
        .from('challenges')
        .select('*')
        .order('id');

      // Only filter by is_active if activeOnly is true
      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log('Challenges loaded from database:', data);
      
      // Cast the difficulty to the correct type
      const typedChallenges = (data || []).map(challenge => ({
        ...challenge,
        difficulty: challenge.difficulty as 'easy' | 'medium' | 'hard'
      }));
      
      setChallenges(typedChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
      setChallenges([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    challenges,
    isLoading,
    refetch: loadChallenges
  };
};
