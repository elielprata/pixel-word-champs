
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserBasicInfoSection } from './user-edit/UserBasicInfoSection';
import { UserRoleSection } from './user-edit/UserRoleSection';
import { UserScoresSection } from './user-edit/UserScoresSection';
import { UserStatusSection } from './user-edit/UserStatusSection';
import { PasswordChangeSection } from './user-edit/PasswordChangeSection';
import { useExtendedUserData } from './user-edit/useExtendedUserData';
import { useExtendedUserActions } from './user-edit/useExtendedUserActions';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  onUserUpdated: () => void;
}

export const EditUserModal = ({ isOpen, onClose, userId, username, onUserUpdated }: EditUserModalProps) => {
  const { data: userData, isLoading: userLoading, refetch, error } = useExtendedUserData(userId, isOpen);
  const { 
    updateUserProfile, 
    updateUserRole, 
    updatePassword, 
    toggleBanStatus,
    isLoading, 
    isChangingPassword 
  } = useExtendedUserActions(
    userId, 
    username, 
    () => {
      console.log('🔄 Usuário atualizado, recarregando dados...');
      refetch();
      onUserUpdated();
    }
  );

  const currentRole = userData?.roles?.[0] || 'user';

  console.log('🔍 Estado do modal:', { 
    isOpen, 
    userId, 
    username, 
    userData, 
    currentRole, 
    userLoading, 
    error 
  });

  if (userLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editando usuário: {username}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <UserBasicInfoSection 
            username={userData?.username || username} 
            email={userData?.email || 'Email não disponível'}
            onUpdate={updateUserProfile}
            isLoading={isLoading}
          />

          <Separator />

          <UserRoleSection 
            currentRole={currentRole}
            isLoading={isLoading}
            onRoleChange={updateUserRole}
          />

          <Separator />

          <UserScoresSection 
            totalScore={userData?.total_score || 0}
            gamesPlayed={userData?.games_played || 0}
            bestDailyPosition={userData?.best_daily_position}
            bestWeeklyPosition={userData?.best_weekly_position}
            onUpdate={updateUserProfile}
            isLoading={isLoading}
          />

          <Separator />

          <UserStatusSection 
            isBanned={userData?.is_banned || false}
            banReason={userData?.ban_reason}
            bannedAt={userData?.banned_at}
            onToggleBan={toggleBanStatus}
            isLoading={isLoading}
          />

          <Separator />

          <PasswordChangeSection 
            onPasswordUpdate={updatePassword}
            isChangingPassword={isChangingPassword}
          />

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
