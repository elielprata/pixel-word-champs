
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users } from 'lucide-react';
import { useAllUsers, AllUsersData } from '@/hooks/useAllUsers';
import { UserListHeader } from './users/UserListHeader';
import { UserCard } from './users/UserCard';
import { UserListEmpty } from './users/UserListEmpty';
import { UserModalsManager } from './users/UserModalsManager';

export const AllUsersList = () => {
  const { usersList, isLoading, resetAllScores, isResettingScores } = useAllUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AllUsersData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const filteredUsers = usersList.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (user: AllUsersData) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditUser = (user: AllUsersData) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleBanUser = (user: AllUsersData) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const handleDeleteUser = (user: AllUsersData) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleResetScores = async (password: string) => {
    await resetAllScores(password);
  };

  const closeModals = () => {
    setSelectedUser(null);
    setShowDetailModal(false);
    setShowBanModal(false);
    setShowDeleteModal(false);
    setShowEditModal(false);
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-lg">
        <UserListHeader
          userCount={0}
          searchTerm=""
          onSearchChange={() => {}}
          onResetScores={() => {}}
          isResettingScores={false}
        />
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
            <span className="ml-2 text-slate-600">Carregando usuários...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-slate-200 shadow-lg">
        <UserListHeader
          userCount={filteredUsers.length}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onResetScores={() => setShowResetModal(true)}
          isResettingScores={isResettingScores}
        />
        
        <CardContent className="p-6">
          <div className="space-y-3">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onViewUser={handleViewUser}
                  onEditUser={handleEditUser}
                  onBanUser={handleBanUser}
                  onDeleteUser={handleDeleteUser}
                />
              ))
            ) : (
              <UserListEmpty searchTerm={searchTerm} />
            )}
          </div>
        </CardContent>
      </Card>

      <UserModalsManager
        selectedUser={selectedUser}
        showDetailModal={showDetailModal}
        showBanModal={showBanModal}
        showDeleteModal={showDeleteModal}
        showEditModal={showEditModal}
        showResetModal={showResetModal}
        isResettingScores={isResettingScores}
        onCloseModals={closeModals}
        onCloseResetModal={() => setShowResetModal(false)}
        onResetScores={handleResetScores}
      />
    </>
  );
};
