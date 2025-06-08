
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
      className={`flex items-center justify-between p-3 border-b border-slate-100 transition-colors hover:bg-slate-50 ${
        user.is_banned ? 'bg-red-50' : 'bg-white'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-1.5 rounded-full">
            <Users className="h-3 w-3 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-medium text-sm ${user.is_banned ? 'text-red-700' : 'text-slate-800'}`}>
                {user.username}
              </span>
              {user.roles.includes('admin') && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-1.5 py-0.5">
                  Admin
                </Badge>
              )}
              {user.is_banned && (
                <Badge className="bg-red-100 text-red-800 border-red-200 text-xs px-1.5 py-0.5">
                  Banido
                </Badge>
              )}
            </div>
            <div className="text-xs text-slate-600">
              {user.email} • {user.games_played} jogos • {user.total_score} pontos
            </div>
            <div className="text-xs text-slate-500">
              Cadastrado: {new Date(user.created_at).toLocaleDateString('pt-BR')}
              {user.is_banned && user.ban_reason && (
                <span className="text-red-600 ml-2">• Motivo: {user.ban_reason}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewUser(user)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 h-7 w-7 p-0"
        >
          <Eye className="h-3 w-3" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditUser(user)}
          className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 h-7 w-7 p-0"
        >
          <Edit className="h-3 w-3" />
        </Button>
        
        {user.is_banned ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBanUser(user)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 h-7 w-7 p-0"
          >
            <UserCheck className="h-3 w-3" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBanUser(user)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200 h-7 w-7 p-0"
          >
            <Ban className="h-3 w-3" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDeleteUser(user)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-7 w-7 p-0"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
