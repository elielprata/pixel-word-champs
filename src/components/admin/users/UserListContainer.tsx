
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { UserListHeader } from './UserListHeader';
import { UserCard } from './UserCard';
import { UserListEmpty } from './UserListEmpty';
import { UserModalsManager } from './UserModalsManager';
import { useAllUsers, AllUsersData } from '@/hooks/useAllUsers';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

export const UserListContainer = () => {
  const { usersList: users = [], isLoading } = useAllUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AllUsersData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (user: AllUsersData) => {
    console.log('👁️ Visualizando usuário:', {
      userId: user.id,
      username: user.username,
      timestamp: getCurrentBrasiliaTime()
    });
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditUser = (user: AllUsersData) => {
    console.log('✏️ Editando usuário:', {
      userId: user.id,
      username: user.username,
      timestamp: getCurrentBrasiliaTime()
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleBanUser = (user: AllUsersData) => {
    console.log('🚫 Banindo usuário:', {
      userId: user.id,
      username: user.username,
      timestamp: getCurrentBrasiliaTime()
    });
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const handleDeleteUser = (user: AllUsersData) => {
    console.log('🗑️ Deletando usuário:', {
      userId: user.id,
      username: user.username,
      timestamp: getCurrentBrasiliaTime()
    });
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleCloseModals = () => {
    setShowDetailModal(false);
    setShowBanModal(false);
    setShowDeleteModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  if (isLoading) {
    return (
      <Card>
        <UserListHeader 
          userCount={0} 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          users={[]}
        />
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Carregando usuários...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <UserListHeader 
          userCount={filteredUsers.length} 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          users={filteredUsers}
        />
        
        {filteredUsers.length === 0 ? (
          <UserListEmpty searchTerm={searchTerm} />
        ) : (
          <div className="p-6">
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onViewUser={handleViewUser}
                  onEditUser={handleEditUser}
                  onBanUser={handleBanUser}
                  onDeleteUser={handleDeleteUser}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      <UserModalsManager
        selectedUser={selectedUser}
        showDetailModal={showDetailModal}
        showBanModal={showBanModal}
        showDeleteModal={showDeleteModal}
        showEditModal={showEditModal}
        showResetModal={false}
        isResettingScores={false}
        onCloseModals={handleCloseModals}
        onCloseResetModal={() => {}}
        onResetScores={async () => {}}
      />
    </>
  );
};
