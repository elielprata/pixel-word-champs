
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealGameMetrics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['gameMetrics'],
    queryFn: async () => {
      // Buscar total de palavras ativas
      const { data: wordsData, error: wordsError } = await supabase
        .from('level_words')
        .select('id')
        .eq('is_active', true);

      if (wordsError) throw wordsError;

      // Buscar total de configurações ativas
      const { data: settingsData, error: settingsError } = await supabase
        .from('game_settings')
        .select('id');

      if (settingsError) throw settingsError;

      // Buscar usuários online (aproximação baseada em sessões recentes)
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('user_id')
        .gte('started_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // últimos 30 minutos
        .order('started_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Contar usuários únicos online
      const uniqueOnlineUsers = new Set(sessionsData?.map(s => s.user_id)).size;

      return {
        activeWords: wordsData?.length || 0,
        activeSettings: settingsData?.length || 0,
        onlineUsers: uniqueOnlineUsers
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  return {
    metrics: metrics || { activeWords: 0, activeSettings: 0, onlineUsers: 0 },
    isLoading
  };
};
