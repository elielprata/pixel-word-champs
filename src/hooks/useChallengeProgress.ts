
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface ChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: number; // Corrigido: banco usa number
  current_level: number;
  total_score: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useChallengeProgress = (challengeId: string) => {
  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (challengeId) {
      loadProgress();
    }
  }, [challengeId]);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Converter challengeId string para number
      const challengeIdNumber = parseInt(challengeId, 10);
      if (isNaN(challengeIdNumber)) {
        throw new Error('ID do desafio inválido');
      }

      const { data, error: fetchError } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeIdNumber)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setProgress(data);
      logger.info('Progresso do desafio carregado', { 
        challengeId, 
        hasProgress: !!data,
        currentLevel: data?.current_level,
        totalScore: data?.total_score
      }, 'CHALLENGE_PROGRESS');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar progresso';
      setError(errorMessage);
      logger.error('Erro ao carregar progresso do desafio', { 
        error: err, 
        challengeId 
      }, 'CHALLENGE_PROGRESS');
    } finally {
      setIsLoading(false);
    }
  };

  const updateChallengeProgress = async (currentLevel: number, totalScore: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Converter challengeId string para number
      const challengeIdNumber = parseInt(challengeId, 10);
      if (isNaN(challengeIdNumber)) {
        throw new Error('ID do desafio inválido');
      }

      const progressData = {
        user_id: user.id,
        challenge_id: challengeIdNumber, // Usar number
        current_level: currentLevel,
        total_score: totalScore,
        updated_at: new Date().toISOString()
      };

      const { data, error: upsertError } = await supabase
        .from('challenge_progress')
        .upsert(progressData, {
          onConflict: 'user_id,challenge_id'
        })
        .select()
        .single();

      if (upsertError) {
        throw upsertError;
      }

      setProgress(data);
      logger.info('Progresso do desafio atualizado', { 
        challengeId, 
        currentLevel, 
        totalScore 
      }, 'CHALLENGE_PROGRESS');

      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar progresso';
      logger.error('Erro ao atualizar progresso do desafio', { 
        error: err, 
        challengeId, 
        currentLevel, 
        totalScore 
      }, 'CHALLENGE_PROGRESS');
      throw err;
    }
  };

  const completeChallengeProgress = async (finalScore: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Converter challengeId string para number
      const challengeIdNumber = parseInt(challengeId, 10);
      if (isNaN(challengeIdNumber)) {
        throw new Error('ID do desafio inválido');
      }

      const completionData = {
        user_id: user.id,
        challenge_id: challengeIdNumber, // Usar number
        current_level: 20, // Máximo de níveis
        total_score: finalScore,
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error: upsertError } = await supabase
        .from('challenge_progress')
        .upsert(completionData, {
          onConflict: 'user_id,challenge_id'
        })
        .select()
        .single();

      if (upsertError) {
        throw upsertError;
      }

      setProgress(data);
      logger.info('Desafio completado', { 
        challengeId, 
        finalScore 
      }, 'CHALLENGE_PROGRESS');

      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao completar desafio';
      logger.error('Erro ao completar desafio', { 
        error: err, 
        challengeId, 
        finalScore 
      }, 'CHALLENGE_PROGRESS');
      throw err;
    }
  };

  return {
    progress,
    isLoading,
    error,
    updateChallengeProgress,
    completeChallengeProgress,
    loadProgress
  };
};
