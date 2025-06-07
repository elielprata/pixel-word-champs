
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ChallengeProgress {
  id: string;
  challenge_id: number;
  current_level: number;
  is_completed: boolean;
  total_score: number;
  completed_at?: string;
}

export const useChallengeProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<number, ChallengeProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap = (data || []).reduce((acc, item) => {
        acc[item.challenge_id] = item;
        return acc;
      }, {} as Record<number, ChallengeProgress>);

      setProgress(progressMap);
    } catch (error) {
      console.error('Error loading challenge progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (challengeId: number, levelScore: number, currentLevel: number) => {
    if (!user) return;

    try {
      const existingProgress = progress[challengeId];
      
      if (existingProgress) {
        // Atualizar progresso existente
        const { data, error } = await supabase
          .from('challenge_progress')
          .update({
            current_level: currentLevel,
            total_score: existingProgress.total_score + levelScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) throw error;
        
        setProgress(prev => ({
          ...prev,
          [challengeId]: data
        }));
      } else {
        // Criar novo progresso
        const { data, error } = await supabase
          .from('challenge_progress')
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            current_level: currentLevel,
            total_score: levelScore
          })
          .select()
          .single();

        if (error) throw error;
        
        setProgress(prev => ({
          ...prev,
          [challengeId]: data
        }));
      }
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  const completeChallenge = async (challengeId: number) => {
    if (!user) return;

    try {
      const existingProgress = progress[challengeId];
      if (!existingProgress) return;

      const { data, error } = await supabase
        .from('challenge_progress')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (error) throw error;
      
      setProgress(prev => ({
        ...prev,
        [challengeId]: data
      }));
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  return {
    progress,
    isLoading,
    updateProgress,
    completeChallenge,
    refetch: loadProgress
  };
};
