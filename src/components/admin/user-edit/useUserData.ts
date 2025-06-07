
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

      // Buscar dados do perfil para pegar informações do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
      }

      // Tentar buscar email do auth.users se possível, senão usar fallback
      let email = 'Email não disponível';
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
        if (!authError && authData.user.email) {
          email = authData.user.email;
        }
      } catch (error) {
        console.log('⚠️ Não foi possível acessar dados do auth, usando fallback');
        // Fallback: buscar na tabela auth.users diretamente se permitido
        const { data: userEmailData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', userId)
          .single();
        
        if (userEmailData) {
          email = `${userEmailData.username}@sistema`;
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
