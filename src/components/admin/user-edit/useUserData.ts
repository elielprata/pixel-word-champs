
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

      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
      }

      // Buscar email real usando a função do banco
      let finalEmail = 'Email não disponível';
      try {
        const { data: usersData, error: usersError } = await supabase.rpc('get_users_with_real_emails');
        
        if (!usersError && usersData) {
          const userData = usersData.find(user => user.id === userId);
          if (userData && userData.email) {
            finalEmail = userData.email;
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao buscar email real:', error);
        
        // Fallback: tentar buscar através do auth se for o usuário atual
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (user && user.id === userId && user.email) {
            finalEmail = user.email;
          } else if (profileData?.username) {
            // Último fallback: usar username como base
            if (profileData.username.includes('@')) {
              finalEmail = profileData.username;
            } else {
              finalEmail = `${profileData.username}@sistema.local`;
            }
          }
        } catch (fallbackError) {
          console.log('⚠️ Erro no fallback:', fallbackError);
        }
      }

      console.log('📋 Dados encontrados:', { 
        roles: rolesData, 
        email: finalEmail, 
        profile: profileData 
      });
      
      return {
        roles: rolesData?.map(r => r.role) || [],
        email: finalEmail,
        username: profileData?.username || 'Username não disponível'
      };
    },
    enabled: isOpen && !!userId,
    retry: 2,
    retryDelay: 1000,
  });
};
