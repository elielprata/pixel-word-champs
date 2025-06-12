
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export const useUserData = (userId: string) => {
  const [userData, setUserData] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadUserData = async () => {
    try {
      console.log('🔍 Carregando dados do usuário:', userId);
      
      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as any)
        .single();

      if (profileError) throw profileError;

      // Buscar email do usuário da auth
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError) {
        console.warn('⚠️ Erro ao buscar dados de auth:', authError);
      }

      // Buscar roles do usuário
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId as any);

      if (rolesError) {
        console.warn('⚠️ Erro ao buscar roles:', rolesError);
      }

      // Filter and validate roles data
      const validRolesData = (rolesData || []).filter((item: any) => 
        item && typeof item === 'object' && !('error' in item)
      );

      const roles = validRolesData.map((r: any) => r.role) || ['user'];
      setUserRoles(roles);
      
      if (profileData && typeof profileData === 'object' && !('error' in profileData)) {
        const combinedData = {
          ...profileData,
          email: authData?.user?.email || 'Email não disponível',
          roles: roles
        };

        console.log('✅ Dados do usuário carregados:', combinedData);
        setUserData(combinedData);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do usuário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  return {
    userData,
    userRoles,
    isLoading,
    refetch: loadUserData
  };
};
