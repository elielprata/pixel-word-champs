
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

      // Buscar dados do auth para pegar o email
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError) {
        console.error('❌ Erro ao buscar dados do auth:', authError);
        throw authError;
      }

      console.log('📋 Dados encontrados:', { roles: rolesData, email: authData.user.email });
      
      return {
        roles: rolesData?.map(r => r.role) || [],
        email: authData.user.email || 'Email não disponível'
      };
    },
    enabled: isOpen && !!userId,
  });
};
