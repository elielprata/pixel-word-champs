
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAllUsers, AllUsersData } from '@/hooks/useAllUsers';
import { UserListHeader } from './users/UserListHeader';
import { UserCard } from './users/UserCard';
import { UserListEmpty } from './users/UserListEmpty';
import { UserModalsManager } from './users/UserModalsManager';

const ITEMS_PER_PAGE = 20;

export const AllUsersList = () => {
  const { usersList, isLoading, resetAllScores, isResettingScores } = useAllUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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

  // Resetar página ao filtrar
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
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
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
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

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuários
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-slate-400 px-1">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
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
        showResetModal={showResetModal}
        isResettingScores={isResettingScores}
        onCloseModals={closeModals}
        onCloseResetModal={() => setShowResetModal(false)}
        onResetScores={handleResetScores}
      />
    </>
  );
};
