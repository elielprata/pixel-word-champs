
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useAllUsers, AllUsersData } from '@/hooks/useAllUsers';
import { UserListHeader } from './UserListHeader';
import { UserCard } from './UserCard';
import { UserModalsManager } from './UserModalsManager';
import { UserListEmpty } from './UserListEmpty';
import { AdminLoadingState } from '../ui/AdminLoadingState';
import { logger } from '@/utils/logger';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

const ITEMS_PER_PAGE = 10;

export const UserListContainer = () => {
  const { 
    usersList, 
    isLoading, 
    banUser, 
    deleteUser, 
    unbanUser
  } = useAllUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AllUsersData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return usersList;
    
    const term = searchTerm.toLowerCase();
    return usersList.filter(user => 
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }, [usersList, searchTerm]);

  // Paginação
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset página quando busca muda
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewUser = (user: AllUsersData) => {
    logger.info('Visualizando usuário', { 
      userId: user.id,
      timestamp: formatBrasiliaDate(new Date())
    }, 'USER_LIST_CONTAINER');
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditUser = (user: AllUsersData) => {
    logger.info('Editando usuário', { 
      userId: user.id,
      timestamp: formatBrasiliaDate(new Date())
    }, 'USER_LIST_CONTAINER');
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleBanUser = (user: AllUsersData) => {
    logger.info('Ação de banimento/desbanimento', { 
      userId: user.id, 
      currentlyBanned: user.is_banned,
      timestamp: formatBrasiliaDate(new Date())
    }, 'USER_LIST_CONTAINER');
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const handleDeleteUser = (user: AllUsersData) => {
    logger.info('Excluindo usuário', { 
      userId: user.id,
      timestamp: formatBrasiliaDate(new Date())
    }, 'USER_LIST_CONTAINER');
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setSelectedUser(null);
    setShowDetailModal(false);
    setShowBanModal(false);
    setShowDeleteModal(false);
    setShowEditModal(false);
  };

  if (isLoading) {
    return <AdminLoadingState message="Carregando usuários..." />;
  }

  return (
    <>
      <Card className="border-slate-200 shadow-sm">
        <UserListHeader
          totalUsers={filteredUsers.length}
          onRefresh={() => window.location.reload()}
          isLoading={isLoading}
        />
        
        <CardContent className="p-0">
          {paginatedUsers.length === 0 ? (
            <UserListEmpty searchTerm={searchTerm} />
          ) : (
            <div className="divide-y divide-slate-100">
              {paginatedUsers.map((user) => (
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
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <div className="text-sm text-slate-600">
                Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm">
                  {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <UserModalsManager
        selectedUser={selectedUser}
        showDetailModal={showDetailModal}
        showBanModal={showBanModal}
        showDeleteModal={showDeleteModal}
        showEditModal={showEditModal}
        onCloseModals={closeModals}
      />
    </>
  );
};
