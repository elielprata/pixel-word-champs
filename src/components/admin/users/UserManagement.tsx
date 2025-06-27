import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserCheck, UserX, RefreshCw, Zap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useResetScores } from '@/hooks/useResetScores';
import { useUsers } from '@/hooks/useUsers';
import { ResetScoresModal } from './ResetScoresModal';

export const UserManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  
  const { 
    users, 
    isLoading, 
    error, 
    refetchUsers,
    banUser,
    unbanUser,
    isBanningUser,
    isUnbanningUser
  } = useUsers();

  const { resetAllScores, isResettingScores } = useResetScores();

  // Filtrar usuários baseado no termo de busca
  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsers = filteredUsers.filter(user => !user.is_banned);
  const bannedUsers = filteredUsers.filter(user => user.is_banned);

  const handleBanUser = async (userId: string, reason: string) => {
    const success = await banUser(userId, reason);
    if (success) {
      toast({
        title: "Usuário banido",
        description: "O usuário foi banido com sucesso.",
      });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    const success = await unbanUser(userId);
    if (success) {
      toast({
        title: "Usuário desbanido",
        description: "O usuário foi desbanido com sucesso.",
      });
    }
  };

  const handleResetScores = async (password: string) => {
    try {
      await resetAllScores(password);
      setShowResetModal(false);
      toast({
        title: "Pontuações resetadas",
        description: "Todas as pontuações foram zeradas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao resetar pontuações",
        variant: "destructive",
      });
    }
  };

  const getUserStatusBadge = (user: any) => {
    if (user.is_banned) {
      return <Badge variant="destructive">Banido</Badge>;
    }
    
    const roles = user.roles || ['user'];
    if (roles.includes('admin')) {
      return <Badge variant="default" className="bg-purple-600">Admin</Badge>;
    }
    
    return <Badge variant="secondary">Ativo</Badge>;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erro ao carregar usuários: {error}</p>
        <Button onClick={refetchUsers} variant="outline" className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com busca e ações */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowResetModal(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            disabled={isResettingScores}
          >
            <Zap className="h-4 w-4 mr-2" />
            Reset Geral
          </Button>
          
          <Button onClick={refetchUsers} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Usuários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Usuários Banidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{bannedUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de usuários */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Ativos ({activeUsers.length})
          </TabsTrigger>
          <TabsTrigger value="banned" className="flex items-center gap-2">
            <UserX className="h-4 w-4" />
            Banidos ({bannedUsers.length})
          </TabsTrigger>
        </TabsList>

        {/* Lista de usuários ativos */}
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-3 text-center py-6">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                <p className="text-gray-500">Carregando usuários...</p>
              </div>
            ) : (
              activeUsers.map(user => (
                <Card key={user.id} className="border">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center justify-between">
                      {user.username}
                      {getUserStatusBadge(user)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-gray-500">Email: {user.email}</p>
                    <p className="text-gray-500">Pontuação: {user.total_score}</p>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBanUser(user.id, 'Motivo padrão')}
                        disabled={isBanningUser}
                      >
                        Banir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Lista de usuários banidos */}
        <TabsContent value="banned">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-3 text-center py-6">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                <p className="text-gray-500">Carregando usuários...</p>
              </div>
            ) : (
              bannedUsers.map(user => (
                <Card key={user.id} className="border">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center justify-between">
                      {user.username}
                      {getUserStatusBadge(user)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-gray-500">Email: {user.email}</p>
                    <p className="text-gray-500">Pontuação: {user.total_score}</p>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnbanUser(user.id)}
                        disabled={isUnbanningUser}
                      >
                        Desbanir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Reset */}
      <ResetScoresModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetScores}
        isResetting={isResettingScores}
      />
    </div>
  );
};
