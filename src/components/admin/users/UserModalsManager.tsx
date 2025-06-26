
import React from 'react';
import { AllUsersData } from '@/hooks/useAllUsers';
import { UserDetailModal } from './UserDetailModal';
import { BanUserModal } from './BanUserModal';
import { DeleteUserModal } from './DeleteUserModal';
import { EditUserModal } from '../EditUserModal';
import { ResetScoresModal } from './ResetScoresModal';
import { logger } from '@/utils/logger';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

interface UserModalsManagerProps {
  selectedUser: AllUsersData | null;
  showDetailModal: boolean;
  showBanModal: boolean;
  showDeleteModal: boolean;
  showEditModal: boolean;
  showResetModal: boolean;
  isResettingScores: boolean;
  onCloseModals: () => void;
  onCloseResetModal: () => void;
  onResetScores: (password: string) => Promise<void>;
}

export const UserModalsManager = ({
  selectedUser,
  showDetailModal,
  showBanModal,
  showDeleteModal,
  showEditModal,
  showResetModal,
  isResettingScores,
  onCloseModals,
  onCloseResetModal,
  onResetScores,
}: UserModalsManagerProps) => {
  logger.debug('Gerenciando modais de usuário', { 
    hasSelectedUser: !!selectedUser,
    showDetailModal,
    showBanModal,
    showDeleteModal,
    showEditModal,
    showResetModal,
    timestamp: getCurrentBrasiliaTime()
  }, 'USER_MODALS_MANAGER');

  return (
    <>
      {selectedUser && (
        <>
          <UserDetailModal
            isOpen={showDetailModal}
            onClose={onCloseModals}
            user={selectedUser}
          />
          
          <BanUserModal
            isOpen={showBanModal}
            onClose={onCloseModals}
            user={selectedUser}
          />
          
          <DeleteUserModal
            isOpen={showDeleteModal}
            onClose={onCloseModals}
            user={selectedUser}
          />
          
          <EditUserModal
            isOpen={showEditModal}
            onClose={onCloseModals}
            userId={selectedUser.id}
            username={selectedUser.username}
            onUserUpdated={() => {}}
          />
        </>
      )}

      <ResetScoresModal
        isOpen={showResetModal}
        onClose={onCloseResetModal}
        onConfirm={onResetScores}
        isResetting={isResettingScores}
      />
    </>
  );
};
