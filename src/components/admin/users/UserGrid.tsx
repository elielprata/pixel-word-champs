
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from 'lucide-react';
import { AllUsersData } from '@/hooks/useUsersQuery';

interface UserGridProps {
  users: AllUsersData[];
  isLoading: boolean;
  onBanUser: (userId: string, reason: string) => void;
  onUnbanUser: (userId: string) => void;
  isBanningUser: boolean;
  isUnbanningUser: boolean;
  getUserStatusBadge: (user: AllUsersData) => React.ReactNode;
}

export const UserGrid = ({
  users,
  isLoading,
  onBanUser,
  onUnbanUser,
  isBanningUser,
  isUnbanningUser,
  getUserStatusBadge
}: UserGridProps) => {
  if (isLoading) {
    return (
      <div className="col-span-3 text-center py-6">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
        <p className="text-gray-500">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <>
      {users.map(user => (
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
              {user.is_banned ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUnbanUser(user.id)}
                  disabled={isUnbanningUser}
                >
                  Desbanir
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onBanUser(user.id, 'Motivo padrão')}
                  disabled={isBanningUser}
                >
                  Banir
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
