
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealGameMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalGames: 0,
    activePlayers: 0,
    averageScore: 0,
    totalWords: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      // Total de palavras ativas
      const { count: wordsCount } = await supabase
        .from('level_words')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true as any);

      // Total de jogos
      const { count: gamesCount } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true as any);

      // Jogadores ativos (que jogaram pelo menos uma vez)
      const { count: playersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('games_played', 0);

      // Pontuação média
      const { data: avgData } = await supabase
        .from('profiles')
        .select('total_score')
        .gt('total_score', 0);

      // Calculate average score safely
      let averageScore = 0;
      if (avgData && avgData.length > 0) {
        const validScores = avgData
          .filter((item: any) => item && typeof item === 'object' && !('error' in item))
          .map((item: any) => item.total_score || 0);
        
        if (validScores.length > 0) {
          const sum = validScores.reduce((acc: number, score: number) => acc + score, 0);
          averageScore = Math.round(sum / validScores.length);
        }
      }

      setMetrics({
        totalGames: gamesCount || 0,
        activePlayers: playersCount || 0,
        averageScore,
        totalWords: wordsCount || 0
      });
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, isLoading, refetch: fetchMetrics };
};
