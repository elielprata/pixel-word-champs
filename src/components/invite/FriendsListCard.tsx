
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Zap, Star } from 'lucide-react';

interface InvitedFriend {
  name: string;
  status: 'Ativo' | 'Pendente';
  reward: number;
  level: number;
  avatar_url?: string;
}

interface FriendsListCardProps {
  invitedFriends: InvitedFriend[];
}

const FriendsListCard = ({ invitedFriends }: FriendsListCardProps) => {
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
          <div className="space-y-3">
            {invitedFriends.map((friend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
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
                        variant={friend.status === 'Ativo' ? 'default' : 'secondary'}
                        className={`text-xs ${friend.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                      >
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

export default FriendsListCard;
