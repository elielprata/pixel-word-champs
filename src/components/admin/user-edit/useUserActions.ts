
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const deleteUserRole = async (userId: string, role: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId as any)
        .eq('role', role);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Role ${role} removido com sucesso.`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao remover role:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o role.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addUserRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId as any, 
          role: role as any 
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Role ${role} adicionado com sucesso.`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao adicionar role:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o role.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const banUser = async (userId: string, reason: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          banned_at: new Date().toISOString(),
          ban_reason: reason,
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário banido com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao banir usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível banir o usuário.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          banned_at: null,
          ban_reason: null,
        })
        .eq('id', userId as any);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário desbanido com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao desbanir usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desbanir o usuário.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteUserRole,
    addUserRole,
    banUser,
    unbanUser,
    isLoading,
  };
};
