
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Eye, EyeOff, Key } from 'lucide-react';

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
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Buscar dados do usuário incluindo email
  const { data: userData, isLoading: userLoading, refetch } = useQuery({
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

  const currentRole = userData?.roles?.[0] || 'user'; // Pega apenas o primeiro role como padrão

  const updateUserRole = async (newRole: 'admin' | 'user') => {
    try {
      setIsLoading(true);
      console.log(`🔄 Atualizando role para ${newRole} do usuário:`, userId);

      // Primeiro, remover todos os roles existentes
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Erro ao remover roles existentes:', deleteError);
        throw deleteError;
      }

      // Depois, adicionar o novo role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        });

      if (insertError) {
        console.error('❌ Erro ao adicionar novo role:', insertError);
        throw insertError;
      }

      toast({
        title: "Sucesso!",
        description: `Permissão atualizada para ${newRole === 'admin' ? 'Administrador' : 'Usuário'} para ${username}`,
      });

      refetch();
      onUserUpdated();
    } catch (error: any) {
      console.error('❌ Erro:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar permissão`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      console.log('🔐 Atualizando senha do usuário:', userId);

      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) {
        console.error('❌ Erro ao atualizar senha:', error);
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: `Senha atualizada para ${username}`,
      });

      setNewPassword('');
      setShowPassword(false);
    } catch (error: any) {
      console.error('❌ Erro:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar senha",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (userLoading) {
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editando usuário: {username}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Informações do usuário */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Informações do usuário</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm"><strong>Username:</strong> {username}</p>
              <p className="text-sm"><strong>Email:</strong> {userData?.email}</p>
            </div>
          </div>

          {/* Permissões do usuário */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Permissão do usuário</h4>
            <RadioGroup
              value={currentRole}
              onValueChange={(value) => updateUserRole(value as 'admin' | 'user')}
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="user" id="user" />
                <Label htmlFor="user" className="flex-1">
                  <div>
                    <span className="font-medium">Usuário</span>
                    <p className="text-xs text-gray-500">Acesso básico à plataforma</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin" className="flex-1">
                  <div>
                    <span className="font-medium">Administrador</span>
                    <p className="text-xs text-gray-500">Acesso total ao painel administrativo</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Troca de senha */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Alterar senha</h4>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nova senha (mín. 6 caracteres)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                onClick={updatePassword}
                disabled={!newPassword || isChangingPassword}
                className="w-full"
                variant="outline"
              >
                <Key className="h-4 w-4 mr-2" />
                {isChangingPassword ? 'Atualizando...' : 'Atualizar Senha'}
              </Button>
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
