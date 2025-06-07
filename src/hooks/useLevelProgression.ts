
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

      // Load existing game sessions for this challenge
      const { data: sessions, error } = await supabase
        .from('game_sessions')
        .select('level, total_score, completed_at')
        .eq('user_id', user.id)
        .eq('is_completed', true)
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

      // Create a new game session for this level
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          level: level,
          board: [], // Empty board for now
          total_score: score,
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error saving level progress:', sessionError);
        return;
      }

      // Update user's total score in profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_score: totalScore + score,
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
      setTotalScore(prev => prev + score);

      console.log(`Level ${level} progress saved with score ${score}`);
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
