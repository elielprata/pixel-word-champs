
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Ban, Trash2, UserCheck, Search, Users } from 'lucide-react';
import { useAllUsers } from '@/hooks/useAllUsers';
import { UserDetailModal } from './users/UserDetailModal';
import { BanUserModal } from './users/BanUserModal';
import { DeleteUserModal } from './users/DeleteUserModal';
import { EditUserModal } from './EditUserModal';

export const AllUsersList = () => {
  const { usersList, isLoading } = useAllUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredUsers = usersList.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleBanUser = (user: any) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const handleDeleteUser = (user: any) => {
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
    return (
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Lista de Usuários
          </CardTitle>
        </CardHeader>
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
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Users className="h-5 w-5 text-blue-600" />
              Lista de Usuários
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {filteredUsers.length} usuários
              </Badge>
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-3">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    user.is_banned 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-2 rounded-full">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${user.is_banned ? 'text-red-700' : 'text-slate-800'}`}>
                            {user.username}
                          </span>
                          {user.roles.includes('admin') && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                              Admin
                            </Badge>
                          )}
                          {user.is_banned && (
                            <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                              Banido
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {user.email} • {user.games_played} jogos • {user.total_score} pontos
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Cadastrado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        {user.is_banned && user.ban_reason && (
                          <div className="text-xs text-red-600 mt-1">
                            Motivo: {user.ban_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewUser(user)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {user.is_banned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBanUser(user)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBanUser(user)}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">
                  {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                </p>
                {searchTerm && (
                  <p className="text-sm text-slate-400 mt-1">
                    Tente ajustar os termos de busca
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      {selectedUser && (
        <>
          <UserDetailModal
            isOpen={showDetailModal}
            onClose={closeModals}
            user={selectedUser}
          />
          
          <BanUserModal
            isOpen={showBanModal}
            onClose={closeModals}
            user={selectedUser}
          />
          
          <DeleteUserModal
            isOpen={showDeleteModal}
            onClose={closeModals}
            user={selectedUser}
          />
          
          <EditUserModal
            isOpen={showEditModal}
            onClose={closeModals}
            userId={selectedUser.id}
            username={selectedUser.username}
            onUserUpdated={() => {}}
          />
        </>
      )}
    </>
  );
};
