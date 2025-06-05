
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { RankingPlayer } from '@/types';

interface PodiumCardProps {
  players: RankingPlayer[];
  isCurrentUser?: (userId: string) => boolean;
}

const PodiumCard = ({ players, isCurrentUser }: PodiumCardProps) => {
  const podiumPlayers = players.slice(0, 3);
  
  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-8 h-8 text-yellow-400" />;
      case 2: return <Medal className="w-7 h-7 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-400" />;
      default: return null;
    }
  };

  const getPodiumColors = (position: number) => {
    switch (position) {
      case 1: return "from-yellow-400 to-yellow-600 h-24";
      case 2: return "from-gray-300 to-gray-500 h-20";
      case 3: return "from-orange-400 to-orange-600 h-16";
      default: return "from-gray-200 to-gray-400 h-12";
    }
  };

  if (podiumPlayers.length === 0) return null;

  return (
    <Card className="mb-6 bg-gradient-to-br from-purple-50 to-blue-50 border-0 shadow-lg overflow-hidden">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">🏆 Top 3</h3>
          <p className="text-sm text-gray-600">Os melhores da competição</p>
        </div>
        
        <div className="flex items-end justify-center gap-4">
          {/* 2º Lugar */}
          {podiumPlayers[1] && (
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-b ${isCurrentUser?.(podiumPlayers[1].user_id) ? 'ring-4 ring-purple-300' : ''} mb-2`}>
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold">
                  {podiumPlayers[1].name.charAt(0)}
                </div>
              </div>
              <div className="text-center mb-2">
                <p className="font-semibold text-sm text-gray-800">{podiumPlayers[1].name}</p>
                <p className="text-xs text-gray-600">{podiumPlayers[1].score.toLocaleString()}</p>
              </div>
              <div className={`w-16 bg-gradient-to-t ${getPodiumColors(2)} rounded-t-lg flex items-start justify-center pt-2`}>
                {getPodiumIcon(2)}
              </div>
              <div className="w-16 h-4 bg-gray-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">2</span>
              </div>
            </div>
          )}

          {/* 1º Lugar */}
          {podiumPlayers[0] && (
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-b ${isCurrentUser?.(podiumPlayers[0].user_id) ? 'ring-4 ring-purple-300' : ''} mb-2`}>
                <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center text-xl font-bold">
                  {podiumPlayers[0].name.charAt(0)}
                </div>
              </div>
              <div className="text-center mb-2">
                <p className="font-bold text-base text-gray-800">{podiumPlayers[0].name}</p>
                <p className="text-sm text-gray-600">{podiumPlayers[0].score.toLocaleString()}</p>
              </div>
              <div className={`w-20 bg-gradient-to-t ${getPodiumColors(1)} rounded-t-lg flex items-start justify-center pt-2`}>
                {getPodiumIcon(1)}
              </div>
              <div className="w-20 h-4 bg-yellow-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
            </div>
          )}

          {/* 3º Lugar */}
          {podiumPlayers[2] && (
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b ${isCurrentUser?.(podiumPlayers[2].user_id) ? 'ring-4 ring-purple-300' : ''} mb-2`}>
                <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-sm font-bold">
                  {podiumPlayers[2].name.charAt(0)}
                </div>
              </div>
              <div className="text-center mb-2">
                <p className="font-semibold text-xs text-gray-800">{podiumPlayers[2].name}</p>
                <p className="text-xs text-gray-600">{podiumPlayers[2].score.toLocaleString()}</p>
              </div>
              <div className={`w-14 bg-gradient-to-t ${getPodiumColors(3)} rounded-t-lg flex items-start justify-center pt-2`}>
                {getPodiumIcon(3)}
              </div>
              <div className="w-14 h-4 bg-orange-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PodiumCard;
