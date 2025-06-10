
import React from 'react';
import { Trophy, Coins, Timer, Users } from 'lucide-react';

interface WeeklyCompetition {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
}

interface RankingHeaderProps {
  weeklyCompetition: WeeklyCompetition | null;
  totalWeeklyPlayers: number;
}

const RankingHeader = ({ weeklyCompetition, totalWeeklyPlayers }: RankingHeaderProps) => {
  const formatTimeRemaining = () => {
    if (!weeklyCompetition) return '';
    
    const now = new Date();
    const endDate = new Date(weeklyCompetition.end_date);
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Competição finalizada';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="text-center space-y-6 mb-8">
      {/* Icon Header */}
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl shadow-2xl">
        <Trophy className="w-10 h-10 text-white" />
      </div>

      {/* Title */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Ranking Semanal
        </h1>
        <p className="text-lg text-gray-600">Competição em andamento</p>
      </div>

      {/* Stats Cards */}
      {weeklyCompetition && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="bg-white p-4 rounded-xl shadow-md border">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Coins className="w-4 h-4" />
              <span className="text-xs font-medium">PRÊMIO</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              R$ {weeklyCompetition.prize_pool.toFixed(0)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md border">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Timer className="w-4 h-4" />
              <span className="text-xs font-medium">TEMPO</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {formatTimeRemaining()}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md border">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">JOGADORES</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {totalWeeklyPlayers}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md border">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-medium">POSIÇÕES</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              Top 10
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingHeader;
