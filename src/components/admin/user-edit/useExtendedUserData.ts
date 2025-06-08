
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useExtendedUserData = (userId: string, isOpen: boolean) => {
  return useQuery({
    queryKey: ['extendedUserData', userId],
    queryFn: async () => {
      console.log('🔍 Buscando dados completos estendidos do usuário:', userId);
      
      // Buscar dados do perfil completo
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      // Buscar roles atuais
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('❌ Erro ao buscar roles:', rolesError);
        throw rolesError;
      }

      // Tentar buscar email do auth se possível
      let email = 'Email não disponível';
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
        if (!authError && authData.user.email) {
          email = authData.user.email;
        }
      } catch (error) {
        console.log('⚠️ Não foi possível acessar dados do auth, usando fallback');
        email = `${profileData.username}@sistema`;
      }

      console.log('📋 Dados encontrados:', { profile: profileData, roles: rolesData, email });
      
      return {
        ...profileData,
        email,
        roles: rolesData?.map(r => r.role) || ['user']
      };
    },
    enabled: isOpen && !!userId,
    retry: 2,
    retryDelay: 1000,
  });
};
