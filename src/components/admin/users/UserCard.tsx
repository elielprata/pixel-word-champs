
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Ban, Trash2, UserCheck, Sword, Crown, Trophy, Star } from 'lucide-react';
import { AllUsersData } from '@/hooks/useAllUsers';

interface UserCardProps {
  user: AllUsersData;
  onViewUser: (user: AllUsersData) => void;
  onEditUser: (user: AllUsersData) => void;
  onBanUser: (user: AllUsersData) => void;
  onDeleteUser: (user: AllUsersData) => void;
}

export const UserCard = ({ user, onViewUser, onEditUser, onBanUser, onDeleteUser }: UserCardProps) => {
  const getPlayerLevel = (score: number) => {
    if (score >= 10000) return { level: 'Lendário', icon: Crown, color: 'from-yellow-400 to-orange-500' };
    if (score >= 5000) return { level: 'Mestre', icon: Trophy, color: 'from-purple-400 to-pink-500' };
    if (score >= 1000) return { level: 'Veterano', icon: Star, color: 'from-blue-400 to-indigo-500' };
    return { level: 'Novato', icon: Sword, color: 'from-green-400 to-emerald-500' };
  };

  const playerLevel = getPlayerLevel(user.total_score);
  const LevelIcon = playerLevel.icon;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-xl ${
        user.is_banned 
          ? 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50' 
          : 'border-slate-200 bg-gradient-to-r from-white to-slate-50 hover:from-blue-50 hover:to-indigo-50'
      }`}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>
      
      <div className="relative p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Avatar/Level Icon */}
            <div className={`relative p-3 rounded-xl bg-gradient-to-br ${playerLevel.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <LevelIcon className="h-6 w-6 text-white" />
              {user.roles.includes('admin') && (
                <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg font-bold truncate ${user.is_banned ? 'text-red-700' : 'text-slate-800'}`}>
                  {user.username}
                </span>
                
                <div className="flex gap-1">
                  <Badge className={`text-xs px-2 py-1 ${playerLevel.color} bg-gradient-to-r text-white border-0`}>
                    {playerLevel.level}
                  </Badge>
                  
                  {user.roles.includes('admin') && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
                      Admin
                    </Badge>
                  )}
                  
                  {user.is_banned && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 text-xs">
                      Banido
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-slate-600 mb-2">
                {user.email}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  <span>{user.total_score.toLocaleString()} pts</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sword className="h-3 w-3" />
                  <span>{user.games_played} batalhas</span>
                </div>
                <span>•</span>
                <span>Desde {new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              
              {user.is_banned && user.ban_reason && (
                <div className="mt-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                  Motivo: {user.ban_reason}
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewUser(user)}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditUser(user)}
              className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            {user.is_banned ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBanUser(user)}
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
              >
                <UserCheck className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBanUser(user)}
                className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
              >
                <Ban className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteUser(user)}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
