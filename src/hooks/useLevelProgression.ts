
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface LevelProgress {
  level: number;
  score: number;
  completedAt: string;
}

export const useLevelProgression = (challengeId: number) => {
  const [levelProgresses, setLevelProgresses] = useState<LevelProgress[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadLevelProgresses();
    }
  }, [isAuthenticated, challengeId]);

  const loadLevelProgresses = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load existing game sessions for this challenge (apenas sessões completadas)
      const { data: sessions, error } = await supabase
        .from('game_sessions')
        .select('level, total_score, completed_at')
        .eq('user_id', user.id)
        .eq('is_completed', true) // Apenas sessões completadas
        .order('level', { ascending: true });

      if (error) {
        console.error('Error loading level progresses:', error);
        return;
      }

      const progresses = sessions?.map(session => ({
        level: session.level,
        score: session.total_score,
        completedAt: session.completed_at
      })) || [];

      setLevelProgresses(progresses);
      setTotalScore(progresses.reduce((sum, p) => sum + p.score, 0));
    } catch (error) {
      console.error('Error loading level progresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLevelProgress = async (level: number, score: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log(`Salvando progresso do nível ${level} com score ${score} pontos (nível completado)`);

      // Create a new game session for this completed level
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          level: level,
          board: [], // Empty board for now
          total_score: score,
          is_completed: true, // Marca como completado apenas quando todas as palavras foram encontradas
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error saving level progress:', sessionError);
        return;
      }

      // Update user's total score in profile (apenas com pontos de níveis completados)
      const newTotalScore = totalScore + score;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_score: newTotalScore,
          games_played: levelProgresses.length + 1
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      // Update local state
      const newProgress: LevelProgress = {
        level,
        score,
        completedAt: new Date().toISOString()
      };

      setLevelProgresses(prev => [...prev, newProgress]);
      setTotalScore(newTotalScore);

      console.log(`Nível ${level} salvo! Score total atualizado para ${newTotalScore} pontos`);
    } catch (error) {
      console.error('Error saving level progress:', error);
    }
  };

  const getHighestCompletedLevel = () => {
    if (levelProgresses.length === 0) return 0;
    return Math.max(...levelProgresses.map(p => p.level));
  };

  const getLevelScore = (level: number) => {
    const progress = levelProgresses.find(p => p.level === level);
    return progress?.score || 0;
  };

  return {
    levelProgresses,
    totalScore,
    isLoading,
    saveLevelProgress,
    getHighestCompletedLevel,
    getLevelScore,
    refetch: loadLevelProgresses
  };
};
