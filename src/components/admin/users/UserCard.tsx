
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCheck, UserX, Edit, Trash2, Crown } from 'lucide-react';

interface UserCardProps {
  user: any;
  onBanUser: (userId: string, reason: string) => void;
  onUnbanUser: (userId: string) => void;
  onEditUser: (user: any) => void;
  onDeleteUser: (userId: string) => void;
  isBanningUser: boolean;
  isUnbanningUser: boolean;
  getUserStatusBadge: (user: any) => React.ReactNode;
}

export const UserCard = ({
  user,
  onBanUser,
  onUnbanUser,
  onEditUser,
  onDeleteUser,
  isBanningUser,
  isUnbanningUser,
  getUserStatusBadge
}: UserCardProps) => {
  const isAdmin = user.roles?.includes('admin');
  const isBanned = user.is_banned;

  return (
    <Card className="hover-shadow transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                {user.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{user.username || 'Sem nome'}</h3>
                {isAdmin && <Crown className="w-3 h-3 text-yellow-500" />}
              </div>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
            </div>
          </div>
          {getUserStatusBadge(user)}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div>
            <span className="text-gray-500">XP:</span>
            <span className="ml-1 font-medium">{user.total_score || 0}</span>
          </div>
          <div>
            <span className="text-gray-500">Jogos:</span>
            <span className="ml-1 font-medium">{user.games_played || 0}</span>
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEditUser(user)}
            className="flex-1 h-7 text-xs hover-glow"
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
          
          {!isAdmin && (
            <>
              {isBanned ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUnbanUser(user.id)}
                  disabled={isUnbanningUser}
                  className="flex-1 h-7 text-xs text-green-600 border-green-200 hover:bg-green-50 hover-glow"
                >
                  <UserCheck className="w-3 h-3 mr-1" />
                  {isUnbanningUser ? '...' : 'Desbanir'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBanUser(user.id, 'Banimento via painel admin')}
                  disabled={isBanningUser}
                  className="flex-1 h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 hover-glow"
                >
                  <UserX className="w-3 h-3 mr-1" />
                  {isBanningUser ? '...' : 'Banir'}
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDeleteUser(user.id)}
                className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 hover-glow"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
