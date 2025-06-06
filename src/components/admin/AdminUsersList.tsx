
import React, { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { AdminUsersListContainer } from './AdminUsersListContainer';
import { EditUserModal } from './EditUserModal';

export const AdminUsersList = () => {
  const [editingUser, setEditingUser] = useState<{ id: string; username: string } | null>(null);
  const { usersList, isLoading, removeAdminRole, refetch } = useAdminUsers();

  return (
    <>
      <AdminUsersListContainer
        usersList={usersList}
        isLoading={isLoading}
        onEditUser={setEditingUser}
        onRemoveUser={removeAdminRole}
      />

      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          userId={editingUser.id}
          username={editingUser.username}
          onUserUpdated={refetch}
        />
      )}
    </>
  );
};
