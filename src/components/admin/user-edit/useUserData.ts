
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserData = (userId: string, isOpen: boolean) => {
  return useQuery({
    queryKey: ['userData', userId],
    queryFn: async () => {
      console.log('🔍 Buscando dados completos do usuário:', userId);
      
      // Buscar roles atuais
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('❌ Erro ao buscar roles:', rolesError);
        throw rolesError;
      }

      console.log('📋 Roles encontrados:', rolesData);

      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
      }

      // Buscar email através do método correto do Supabase
      let email = 'Email não disponível';
      try {
        // Tentar buscar através do auth se tivermos permissões
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // Se o usuário logado for o mesmo que estamos editando, podemos usar seu email
        if (user && user.id === userId) {
          email = user.email || 'Email não disponível';
        } else {
          // Para outros usuários, vamos usar um fallback baseado no username
          if (profileData?.username) {
            // Verificar se o username já parece um email
            if (profileData.username.includes('@')) {
              email = profileData.username;
            } else {
              email = `${profileData.username}@sistema.local`;
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Não foi possível acessar dados do auth:', error);
        // Fallback: usar email baseado no username
        if (profileData?.username) {
          if (profileData.username.includes('@')) {
            email = profileData.username;
          } else {
            email = `${profileData.username}@sistema.local`;
          }
        }
      }

      console.log('📋 Dados encontrados:', { roles: rolesData, email, profile: profileData });
      
      return {
        roles: rolesData?.map(r => r.role) || [],
        email: email,
        username: profileData?.username || 'Username não disponível'
      };
    },
    enabled: isOpen && !!userId,
    retry: 2,
    retryDelay: 1000,
  });
};
