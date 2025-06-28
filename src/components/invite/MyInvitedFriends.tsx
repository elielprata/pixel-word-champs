
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, Zap, Crown, Clock, CheckCircle } from 'lucide-react';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

interface InvitedFriend {
  name: string;
  status: 'Ativo' | 'Pendente';
  reward: number;
  level: number;
  avatar_url?: string;
  total_score: number;
  games_played: number;
  invited_at: string;
  activated_at?: string;
}

interface MyInvitedFriendsProps {
  invitedFriends: InvitedFriend[];
}

const MyInvitedFriends = ({ invitedFriends }: MyInvitedFriendsProps) => {
  const activeFriends = invitedFriends.filter(friend => friend.status === 'Ativo');
  const pendingFriends = invitedFriends.filter(friend => friend.status === 'Pendente');

  const getFriendIcon = (friend: InvitedFriend) => {
    if (friend.status === 'Ativo' && friend.level >= 15) return '👑';
    if (friend.status === 'Ativo' && friend.level >= 10) return '🏆';
    if (friend.status === 'Ativo' && friend.level >= 5) return '🌟';
    if (friend.status === 'Ativo') return '✨';
    return '⏳';
  };

  const getFriendBadgeColor = (friend: InvitedFriend) => {
    if (friend.status === 'Ativo' && friend.level >= 10) return 'bg-yellow-100 text-yellow-800';
    if (friend.status === 'Ativo') return 'bg-green-100 text-green-700';
    return 'bg-orange-100 text-orange-700';
  };

  const formatRelativeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Hoje';
      if (diffInDays === 1) return 'Ontem';
      if (diffInDays < 7) return `${diffInDays} dias atrás`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
      return formatBrasiliaDate(date, 'dd/MM/yyyy');
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
          <Users className="w-5 h-5" />
          Minha Equipe ({invitedFriends.length})
          {activeFriends.length > 0 && (
            <Badge className="bg-green-100 text-green-700 ml-2">
              {activeFriends.length} ativos
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invitedFriends.length > 0 ? (
          <div className="space-y-3">
            {/* Estatísticas Rápidas Melhoradas */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{invitedFriends.length}</p>
                  <p className="text-xs opacity-90">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-200">{activeFriends.length}</p>
                  <p className="text-xs opacity-90">Ativos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-200">
                    {invitedFriends.reduce((sum, friend) => sum + friend.reward, 0)}
                  </p>
                  <p className="text-xs opacity-90">XP Total</p>
                </div>
              </div>
            </div>

            {/* Lista de Amigos Melhorada */}
            {invitedFriends.map((friend, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                      {friend.avatar_url ? (
                        <img src={friend.avatar_url} alt={friend.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        friend.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1 text-lg">
                      {getFriendIcon(friend)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{friend.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getFriendBadgeColor(friend)}`}>
                        {friend.status === 'Ativo' ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Ativo
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pendente
                          </div>
                        )}
                      </Badge>
                      {friend.level > 1 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600 font-medium">Nv. {friend.level}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>Convidado {formatRelativeDate(friend.invited_at)}</span>
                      {friend.activated_at && (
                        <span>• Ativo desde {formatRelativeDate(friend.activated_at)}</span>
                      )}
                    </div>
                    {friend.status === 'Ativo' && (
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                        <span>{friend.total_score.toLocaleString()} pontos</span>
                        <span>• {friend.games_played} jogos</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-green-600" />
                    <p className="font-bold text-green-600">+{friend.reward}</p>
                  </div>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
              </div>
            ))}

            {/* Dica para mais convites com metas progressivas */}
            {invitedFriends.length < 10 && (
              <div className="mt-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 text-center">
                <Crown className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                {invitedFriends.length < 5 ? (
                  <p className="text-sm font-medium text-purple-800">
                    Convide mais {5 - invitedFriends.length} amigos para ganhar 100 XP bônus!
                  </p>
                ) : (
                  <p className="text-sm font-medium text-purple-800">
                    Alcance 10 convites para se tornar um Mestre dos Convites!
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <p className="font-medium mb-1">Sua equipe está vazia</p>
            <p className="text-sm">Comece convidando seus amigos para formar sua equipe!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyInvitedFriends;
