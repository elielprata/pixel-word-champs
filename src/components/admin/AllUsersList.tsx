
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <UserListHeader
          userCount={0}
          searchTerm=""
          onSearchChange={() => {}}
          onResetScores={() => {}}
          isResettingScores={false}
        />
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-blue-300 opacity-30"></div>
            </div>
            <span className="ml-4 text-slate-600 font-medium">Carregando guerreiros...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <UserListHeader
          userCount={filteredUsers.length}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onResetScores={() => setShowResetModal(true)}
          isResettingScores={isResettingScores}
        />
        
        <CardContent className="p-6">
          <div className="space-y-4">
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
