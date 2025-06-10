
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp, Star } from 'lucide-react';

interface UserPositionCardProps {
  position: number | null;
  score: number;
  userName: string;
  type: 'daily' | 'weekly';
}

const UserPositionCard = ({ position, score, userName, type }: UserPositionCardProps) => {
  if (!position) return null;

  const getPositionColor = () => {
    if (position <= 3) return "from-yellow-400 to-orange-500";
    if (position <= 10) return "from-purple-400 to-purple-600";
    if (position <= 50) return "from-blue-400 to-blue-600";
    return "from-gray-400 to-gray-600";
  };

  const getPositionIcon = () => {
    if (position <= 3) return <Trophy className="w-6 h-6" />;
    if (position <= 10) return <Star className="w-6 h-6" />;
    return <TrendingUp className="w-6 h-6" />;
  };

  return (
    <Card className={`mb-6 bg-gradient-to-r ${getPositionColor()} text-white border-0 shadow-lg`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPositionIcon()}
            <div>
              <p className="font-semibold text-sm opacity-90">
                {type === 'daily' ? 'Competições Diárias' : 'Competição Semanal'}
              </p>
              <p className="font-bold text-lg">Sua Posição: #{position}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Pontuação</p>
            <p className="text-xl font-bold">{score.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPositionCard;
