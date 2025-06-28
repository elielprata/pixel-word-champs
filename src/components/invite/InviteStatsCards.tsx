
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from 'lucide-react';

interface InviteStatsCardsProps {
  stats: {
    totalPoints: number;
    activeFriends: number;
    totalInvites: number;
  };
}

const InviteStatsCards = ({ stats }: InviteStatsCardsProps) => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 text-purple-600 mr-1" />
            <div className="text-2xl font-bold text-purple-600">{stats.totalPoints}</div>
          </div>
          <div className="text-xs text-gray-600">XP Ganho</div>
        </CardContent>
      </Card>
      <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.activeFriends}</div>
          <div className="text-xs text-gray-600 mt-1">Amigos Ativos</div>
        </CardContent>
      </Card>
      <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.totalInvites}</div>
          <div className="text-xs text-gray-600 mt-1">Total Convites</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteStatsCards;
