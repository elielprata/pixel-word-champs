
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealGameMetrics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['gameMetrics'],
    queryFn: async () => {
      console.log('🔍 Buscando métricas do sistema...');
      
      // Buscar total de palavras ativas
      const { data: wordsData, error: wordsError } = await supabase
        .from('level_words')
        .select('id, word, level, category, difficulty')
        .eq('is_active', true);

      if (wordsError) {
        console.error('❌ Erro ao buscar palavras:', wordsError);
        throw wordsError;
      }

      console.log('📝 Palavras encontradas:', wordsData?.length, wordsData);

      // Buscar total de configurações ativas
      const { data: settingsData, error: settingsError } = await supabase
        .from('game_settings')
        .select('id, setting_key, setting_value, category, description');

      if (settingsError) {
        console.error('❌ Erro ao buscar configurações:', settingsError);
        throw settingsError;
      }

      console.log('⚙️ Configurações encontradas:', settingsData?.length, settingsData);

      // Buscar usuários online (aproximação baseada em sessões recentes)
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('user_id, started_at')
        .gte('started_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // últimos 30 minutos
        .order('started_at', { ascending: false });

      if (sessionsError) {
        console.error('❌ Erro ao buscar sessões:', sessionsError);
        throw sessionsError;
      }

      // Contar usuários únicos online
      const uniqueOnlineUsers = new Set(sessionsData?.map(s => s.user_id)).size;
      console.log('👥 Usuários online:', uniqueOnlineUsers, 'Sessões:', sessionsData?.length);

      const result = {
        activeWords: wordsData?.length || 0,
        activeSettings: settingsData?.length || 0,
        onlineUsers: uniqueOnlineUsers
      };

      console.log('📊 Métricas finais:', result);
      return result;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  return {
    metrics: metrics || { activeWords: 0, activeSettings: 0, onlineUsers: 0 },
    isLoading
  };
};
