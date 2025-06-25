import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { UserListHeader } from './UserListHeader';
import { UserCard } from './UserCard';
import { UserListEmpty } from './UserListEmpty';
import { UserModalsManager } from './UserModalsManager';
import { useAllUsers } from '@/hooks/useAllUsers';
import { User } from '@/types/admin';

export const UserListContainer = () => {
  const { data: users = [], isLoading } = useAllUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserAction = (user: User, action: string) => {
    setSelectedUser(user);
    switch (action) {
      case 'view':
        setShowDetailModal(true);
        break;
      case 'ban':
        setShowBanModal(true);
        break;
      case 'delete':
        setShowDeleteModal(true);
        break;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <UserListHeader 
          userCount={0} 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
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
                  onAction={handleUserAction}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      <UserModalsManager
        selectedUser={selectedUser}
        showDeleteModal={showDeleteModal}
        showBanModal={showBanModal}
        showDetailModal={showDetailModal}
        onCloseDeleteModal={() => setShowDeleteModal(false)}
        onCloseBanModal={() => setShowBanModal(false)}
        onCloseDetailModal={() => setShowDetailModal(false)}
        onClearSelection={() => setSelectedUser(null)}
      />
    </>
  );
};
