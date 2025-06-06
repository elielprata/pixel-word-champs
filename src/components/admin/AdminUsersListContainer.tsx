
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from 'lucide-react';
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Administradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Administradores ({usersList.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            <p className="text-gray-500 text-center py-4">
              Nenhum administrador encontrado
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
