
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Zap, Star, Calendar, Trophy } from 'lucide-react';

interface InvitedFriend {
  name: string;
  status: 'Ativo' | 'Parcialmente Ativo' | 'Pendente';
  reward: number;
  level: number;
  avatar_url?: string;
  total_score: number;
  games_played: number;
  invited_at: string;
  activated_at?: string;
  days_played?: number;
  progress_to_full_reward?: number;
}

interface MyInvitedFriendsProps {
  invitedFriends: InvitedFriend[];
}

const MyInvitedFriends = ({ invitedFriends }: MyInvitedFriendsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Parcialmente Ativo':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <Trophy className="w-3 h-3" />;
      case 'Parcialmente Ativo':
        return <Calendar className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
          <Users className="w-5 h-5" />
          Meus Convites ({invitedFriends.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invitedFriends.length > 0 ? (
          <div className="space-y-4">
            {invitedFriends.map((friend, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {friend.avatar_url ? (
                        <img src={friend.avatar_url} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        friend.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{friend.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary"
                          className={`text-xs ${getStatusColor(friend.status)} flex items-center gap-1`}
                        >
                          {getStatusIcon(friend.status)}
                          {friend.status}
                        </Badge>
                        {friend.level > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">Nível {friend.level}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <p className="font-bold text-purple-600">+{friend.reward}</p>
                    </div>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                </div>

                {/* Progresso para recompensa completa */}
                {friend.status === 'Parcialmente Ativo' && friend.progress_to_full_reward !== undefined && (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Progresso para 50 XP</span>
                      <span className="text-gray-600">{Math.round(friend.progress_to_full_reward)}%</span>
                    </div>
                    <Progress 
                      value={friend.progress_to_full_reward} 
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500">
                      {friend.days_played || 0}/5 dias de atividade • 
                      {friend.days_played && friend.days_played >= 5 
                        ? ' Pronto para ativação!' 
                        : ` Faltam ${5 - (friend.days_played || 0)} dias`
                      }
                    </p>
                  </div>
                )}

                {/* Informações adicionais */}
                <div className="mt-3 flex justify-between text-xs text-gray-500">
                  <span>
                    {friend.games_played} jogos • {friend.total_score} pontos
                  </span>
                  {friend.activated_at && (
                    <span>
                      Ativado em {new Date(friend.activated_at).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium mb-1">Nenhum convite ainda</p>
            <p className="text-sm">Copie seu código e convide amigos para ganharem XP!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyInvitedFriends;
