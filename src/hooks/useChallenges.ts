
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

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('id');

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
      setChallenges([]); // Clear mocked data on error
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
