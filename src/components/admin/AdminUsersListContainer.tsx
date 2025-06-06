
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield } from 'lucide-react';
import { AdminUser } from '@/hooks/useAdminUsers';
import { AdminUserItem } from './AdminUserItem';

interface AdminUsersListContainerProps {
  usersList: AdminUser[];
  isLoading: boolean;
  onEditUser: (user: { id: string; username: string }) => void;
  onRemoveUser: (userId: string, username: string) => void;
}

export const AdminUsersListContainer = ({ 
  usersList, 
  isLoading, 
  onEditUser, 
  onRemoveUser 
}: AdminUsersListContainerProps) => {
  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <div className="bg-green-100 p-2 rounded-lg">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            <span>Lista de Administradores</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
            <span className="ml-2 text-slate-600">Carregando administradores...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
        <CardTitle className="flex items-center justify-between text-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            <span>Lista de Administradores</span>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {usersList.length} {usersList.length === 1 ? 'administrador' : 'administradores'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {usersList.length > 0 ? (
            usersList.map((user) => (
              <AdminUserItem
                key={user.id}
                user={user}
                onEdit={onEditUser}
                onRemove={onRemoveUser}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Nenhum administrador encontrado</p>
              <p className="text-sm text-slate-400 mt-1">
                Use o formulário ao lado para criar o primeiro administrador
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
