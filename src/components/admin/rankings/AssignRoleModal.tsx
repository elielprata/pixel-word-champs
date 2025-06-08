
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCog, Shield, User, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface AssignRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
  currentRole: string;
  onRoleUpdated: () => void;
}

export const AssignRoleModal = ({ 
  open, 
  onOpenChange, 
  userId, 
  username, 
  currentRole,
  onRoleUpdated 
}: AssignRoleModalProps) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const roles = [
    { 
      value: 'user', 
      label: 'Usuário', 
      description: 'Acesso básico à plataforma',
      icon: User,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    { 
      value: 'admin', 
      label: 'Administrador', 
      description: 'Acesso total ao painel administrativo',
      icon: Shield,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  const handleRoleUpdate = async () => {
    if (selectedRole === currentRole) {
      onOpenChange(false);
      return;
    }

    try {
      setIsUpdating(true);
      console.log(`🔄 Atualizando role para ${selectedRole} do usuário:`, userId);

      // Remover roles existentes
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Erro ao remover roles existentes:', deleteError);
        throw deleteError;
      }

      // Adicionar novo role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: selectedRole
        });

      if (insertError) {
        console.error('❌ Erro ao adicionar novo role:', insertError);
        throw insertError;
      }

      toast({
        title: "Função atualizada!",
        description: `${username} agora tem a função de ${selectedRole === 'admin' ? 'Administrador' : 'Usuário'}`,
      });

      onRoleUpdated();
      onOpenChange(false);

    } catch (error: any) {
      console.error('❌ Erro completo:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar função: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentRoleInfo = () => {
    return roles.find(role => role.value === currentRole) || roles[0];
  };

  const currentRoleInfo = getCurrentRoleInfo();
  const CurrentRoleIcon = currentRoleInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <UserCog className="h-5 w-5 text-blue-600" />
            Atribuir Função
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do usuário */}
          <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">{username}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-600">Função atual:</span>
                  <Badge className={`${currentRoleInfo.color} text-xs`}>
                    <CurrentRoleIcon className="h-3 w-3 mr-1" />
                    {currentRoleInfo.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Seleção de função */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">
              Selecionar nova função:
            </Label>
            
            <RadioGroup
              value={selectedRole}
              onValueChange={setSelectedRole}
              className="space-y-3"
            >
              {roles.map((role) => {
                const RoleIcon = role.icon;
                const isSelected = selectedRole === role.value;
                const isCurrent = currentRole === role.value;
                
                return (
                  <div
                    key={role.value}
                    className={`relative flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <RadioGroupItem value={role.value} id={role.value} />
                    <div className="flex-1">
                      <Label htmlFor={role.value} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <RoleIcon className="h-4 w-4 text-slate-600" />
                          <span className="font-medium">{role.label}</span>
                          {isCurrent && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Atual
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                      </Label>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRoleUpdate}
              disabled={isUpdating || selectedRole === currentRole}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              {isUpdating ? 'Atualizando...' : 'Atualizar Função'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
