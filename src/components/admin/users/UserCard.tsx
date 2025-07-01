
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Ban, Trash2, UserCheck, Users } from 'lucide-react';
import { AllUsersData } from '@/hooks/useAllUsers';
import { logger } from '@/utils/logger';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

interface UserCardProps {
  user: AllUsersData;
  onViewUser: (user: AllUsersData) => void;
  onEditUser: (user: AllUsersData) => void;
  onBanUser: (user: AllUsersData) => void;
  onDeleteUser: (user: AllUsersData) => void;
}

export const UserCard = ({ user, onViewUser, onEditUser, onBanUser, onDeleteUser }: UserCardProps) => {
  const handleViewUser = () => {
    logger.info('Visualizando detalhes do usuário', { userId: user.id }, 'USER_CARD');
    onViewUser(user);
  };

  const handleEditUser = () => {
    logger.info('Editando usuário', { userId: user.id }, 'USER_CARD');
    onEditUser(user);
  };

  const handleBanUser = () => {
    const action = user.is_banned ? 'desbanindo' : 'banindo';
    logger.info(`Ação de ${action} usuário`, { userId: user.id, currentlyBanned: user.is_banned }, 'USER_CARD');
    onBanUser(user);
  };

  const handleDeleteUser = () => {
    logger.info('Excluindo usuário', { userId: user.id }, 'USER_CARD');
    onDeleteUser(user);
  };

  return (
    <div className={`px-4 py-3 transition-colors hover:bg-slate-50/80 ${user.is_banned ? 'bg-red-50/30' : ''}`}>
      <div className="flex items-center justify-between">
        {/* Informações do usuário */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`font-medium text-sm truncate ${user.is_banned ? 'text-red-700' : 'text-slate-900'}`}>
                {user.username}
              </span>
              
              <div className="flex items-center space-x-1">
                {user.roles.includes('admin') && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 border-purple-200">
                    Admin
                  </Badge>
                )}
                {user.is_banned && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                    Banido
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-xs text-slate-600 truncate">
              {user.email}
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
              <span>{user.games_played} jogos</span>
              <span>•</span>
              <span>{user.total_score} pts</span>
              <span>•</span>
              <span>{formatBrasiliaDate(new Date(user.created_at), false)}</span>
            </div>
            
            {user.is_banned && user.ban_reason && (
              <div className="text-xs text-red-600 mt-1 truncate">
                Motivo: {user.ban_reason}
              </div>
            )}
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex items-center space-x-1 flex-shrink-0 ml-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewUser}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Visualizar"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditUser}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            title="Editar"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          
          {user.is_banned ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBanUser}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Desbanir"
            >
              <UserCheck className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBanUser}
              className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              title="Banir"
            >
              <Ban className="h-3.5 w-3.5" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteUser}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Excluir"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
