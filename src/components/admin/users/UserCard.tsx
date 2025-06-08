
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Ban, Trash2, UserCheck, Users } from 'lucide-react';
import { AllUsersData } from '@/hooks/useAllUsers';

interface UserCardProps {
  user: AllUsersData;
  onViewUser: (user: AllUsersData) => void;
  onEditUser: (user: AllUsersData) => void;
  onBanUser: (user: AllUsersData) => void;
  onDeleteUser: (user: AllUsersData) => void;
}

export const UserCard = ({ user, onViewUser, onEditUser, onBanUser, onDeleteUser }: UserCardProps) => {
  return (
    <div
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
          onClick={() => onViewUser(user)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditUser(user)}
          className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        {user.is_banned ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBanUser(user)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
          >
            <UserCheck className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBanUser(user)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
          >
            <Ban className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDeleteUser(user)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
