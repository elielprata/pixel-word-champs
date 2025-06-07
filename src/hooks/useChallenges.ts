
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
        .order('id');

      if (error) throw error;
      
      // Garantir que os dados estão no formato correto
      const typedChallenges = (data || []).map(challenge => ({
        ...challenge,
        difficulty: challenge.difficulty as 'easy' | 'medium' | 'hard',
        description: challenge.description || '',
        theme: challenge.theme || 'default',
        color: challenge.color || 'blue',
        levels: challenge.levels || 20,
        is_active: challenge.is_active !== false
      }));
      
      setChallenges(typedChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
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
