
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserProfileSection } from './user-edit/UserProfileSection';
import { UserRoleSection } from './user-edit/UserRoleSection';
import { PasswordChangeSection } from './user-edit/PasswordChangeSection';
import { useUserData } from './user-edit/useUserData';
import { useUserActions } from './user-edit/useUserActions';
import { logger } from '@/utils/logger';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  onUserUpdated: () => void;
}

export const EditUserModal = ({ isOpen, onClose, userId, username, onUserUpdated }: EditUserModalProps) => {
  const { data: userData, isLoading: userLoading, refetch, error } = useUserData(userId, isOpen);
  const { 
    updateUserRole, 
    updateUserProfile, 
    updatePassword, 
    isLoading, 
    isChangingPassword, 
    isUpdatingProfile 
  } = useUserActions(
    userId, 
    username, 
    () => {
      logger.info('Usuário atualizado, recarregando dados...', { userId }, 'EDIT_USER_MODAL');
      refetch();
      onUserUpdated();
    }
  );

  const currentRole = userData?.roles?.[0] || 'user';

  logger.debug('Estado do modal de edição', { 
    isOpen, 
    userId, 
    username, 
    currentRole, 
    userLoading, 
    hasError: !!error 
  }, 'EDIT_USER_MODAL');

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

  if (error) {
    logger.error('Erro ao carregar dados do usuário', { 
      error: error.message, 
      userId 
    }, 'EDIT_USER_MODAL');
    
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editando usuário: {username}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-red-500">Erro ao carregar dados: {error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Tentar Novamente
            </Button>
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
            isUpdating={isUpdatingProfile}
            onProfileUpdate={updateUserProfile}
          />

          <UserRoleSection 
            currentRole={currentRole}
            isLoading={isLoading}
            onRoleChange={updateUserRole}
          />

          <PasswordChangeSection 
            onPasswordUpdate={updatePassword}
            isChangingPassword={isChangingPassword}
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
