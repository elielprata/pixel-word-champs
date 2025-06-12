
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RankingPlayer } from '@/types';
import { BadgeDollarSign, Medal, Trophy } from 'lucide-react';

interface RankingInfoCardProps {
  title: string;
  icon: React.ElementType;
  data: RankingPlayer[];
  color: string;
}

export const RankingInfoCard = ({ title, icon: Icon, data, color }: RankingInfoCardProps) => {
  const mockDailyRanking = [
    { position: 1, username: "Carlos Pereira", score: 750 },
    { position: 2, username: "Maria Silva", score: 720 },
    { position: 3, username: "Joao Santos", score: 685 }
  ];

  const rankingToDisplay = data && data.length > 0 ? data.slice(0, 3) : mockDailyRanking;
  
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
          </div>
        </div>

        <div className="space-y-3">
          {rankingToDisplay.map((player, index) => (
            <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center 
                  ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-700'}
                  text-white font-semibold text-xs
                `}>
                  {index === 0 ? <Trophy className="h-3 w-3" /> : index === 1 ? <Medal className="h-3 w-3" /> : <BadgeDollarSign className="h-3 w-3" />}
                </div>
                <span className="font-medium text-slate-800 text-sm">{player.username}</span>
              </div>
              <span className="text-slate-600 text-sm font-semibold">{player.score} pts</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
