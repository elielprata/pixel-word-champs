
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  onUserUpdated: () => void;
}

export const EditUserModal = ({ isOpen, onClose, userId, username, onUserUpdated }: EditUserModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Buscar roles atuais do usuário
  const { data: userRoles, isLoading: rolesLoading, refetch } = useQuery({
    queryKey: ['userRoles', userId],
    queryFn: async () => {
      console.log('🔍 Buscando roles do usuário:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao buscar roles:', error);
        throw error;
      }

      console.log('📋 Roles encontrados:', data);
      return data?.map(r => r.role) || [];
    },
    enabled: isOpen && !!userId,
  });

  const hasAdminRole = userRoles?.includes('admin') || false;
  const hasUserRole = userRoles?.includes('user') || false;

  const updateUserRole = async (role: 'admin' | 'user', shouldHave: boolean) => {
    try {
      setIsLoading(true);
      console.log(`🔄 ${shouldHave ? 'Adicionando' : 'Removendo'} role ${role} para usuário:`, userId);

      if (shouldHave) {
        // Adicionar role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: role
          });

        if (error) {
          console.error('❌ Erro ao adicionar role:', error);
          throw error;
        }
      } else {
        // Remover role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);

        if (error) {
          console.error('❌ Erro ao remover role:', error);
          throw error;
        }
      }

      toast({
        title: "Sucesso!",
        description: `Role ${role} ${shouldHave ? 'adicionado' : 'removido'} para ${username}`,
      });

      refetch();
      onUserUpdated();
    } catch (error: any) {
      console.error('❌ Erro:', error);
      toast({
        title: "Erro",
        description: `Erro ao ${shouldHave ? 'adicionar' : 'remover'} role ${role}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (rolesLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editando usuário: {username}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-500">Carregando...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editando usuário: {username}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Permissões do usuário</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Administrador</label>
                <p className="text-xs text-gray-500">Acesso total ao painel administrativo</p>
              </div>
              <Switch
                checked={hasAdminRole}
                onCheckedChange={(checked) => updateUserRole('admin', checked)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Usuário</label>
                <p className="text-xs text-gray-500">Acesso básico à plataforma</p>
              </div>
              <Switch
                checked={hasUserRole}
                onCheckedChange={(checked) => updateUserRole('user', checked)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
