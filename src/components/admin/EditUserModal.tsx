
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserInfoDisplay } from './user-edit/UserInfoDisplay';
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
  const { data: userData, isLoading: userLoading, refetch } = useUserData(userId, isOpen);
  const { updateUserRole, updatePassword, isLoading, isChangingPassword } = useUserActions(
    userId, 
    username, 
    () => {
      refetch();
      onUserUpdated();
    }
  );

  const currentRole = userData?.roles?.[0] || 'user';

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
          <UserInfoDisplay 
            username={username} 
            email={userData?.email || 'Email não disponível'} 
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
