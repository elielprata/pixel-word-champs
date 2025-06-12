
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserProfileSection } from './user-edit/UserProfileSection';
import { UserRoleSection } from './user-edit/UserRoleSection';
import { PasswordChangeSection } from './user-edit/PasswordChangeSection';
import { useUserData } from './user-edit/useUserData';
import { useUserActions } from './user-edit/useUserActions';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  onUserUpdated: () => void;
}

export const EditUserModal = ({ isOpen, onClose, userId, username, onUserUpdated }: EditUserModalProps) => {
  const { userData, userRoles, isLoading: userLoading, refetch } = useUserData(userId);
  const { 
    addUserRole, 
    deleteUserRole, 
    banUser, 
    unbanUser, 
    isLoading 
  } = useUserActions();

  const currentRole = userRoles?.[0] || 'user';

  console.log('🔍 Estado do modal:', { 
    isOpen, 
    userId, 
    username, 
    userData, 
    currentRole, 
    userLoading 
  });

  const handleRoleChange = async (newRole: 'admin' | 'user') => {
    console.log('🔄 Alterando role para:', newRole);
    
    // Remove role atual se existir
    if (currentRole && currentRole !== newRole) {
      await deleteUserRole(userId, currentRole);
    }
    
    // Adiciona novo role
    const success = await addUserRole(userId, newRole);
    if (success) {
      refetch();
      onUserUpdated();
    }
  };

  const handleProfileUpdate = async (username: string, email: string) => {
    // Placeholder function - not implemented in useUserActions
    console.log('🔄 Atualizando perfil:', { username, email });
  };

  const handlePasswordUpdate = async (newPassword: string) => {
    // Placeholder function - not implemented in useUserActions
    console.log('🔄 Atualizando senha:', newPassword);
  };

  if (userLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editando usuário: {username}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-500">Carregando dados do usuário...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editando usuário: {username}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <UserProfileSection 
            currentUsername={userData?.username || username}
            currentEmail={userData?.email || 'Email não disponível'}
            isUpdating={false}
            onProfileUpdate={handleProfileUpdate}
          />

          <UserRoleSection 
            currentRole={currentRole}
            isLoading={isLoading}
            onRoleChange={handleRoleChange}
          />

          <PasswordChangeSection 
            onPasswordUpdate={handlePasswordUpdate}
            isChangingPassword={false}
          />

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
