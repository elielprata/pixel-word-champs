
import React from 'react';
import { Trophy, Clock, Coins } from 'lucide-react';

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
    
    if (diff <= 0) return 'Finalizada';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="text-center space-y-4">
      {/* Main Trophy Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-xl">
        <Trophy className="w-8 h-8 text-white" />
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-1">
          Ranking Semanal
        </h1>
        <p className="text-gray-600">Competição em andamento</p>
      </div>

      {/* Stats Grid - Compacto */}
      {weeklyCompetition && (
        <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
          <div className="bg-white p-3 rounded-lg shadow-md border border-yellow-100">
            <div className="flex items-center gap-1 text-yellow-600 mb-1">
              <Coins className="w-4 h-4" />
              <span className="text-xs font-semibold">PRÊMIO</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              R$ {weeklyCompetition.prize_pool.toFixed(0)}
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-md border border-blue-100">
            <div className="flex items-center gap-1 text-blue-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold">TEMPO</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatTimeRemaining()}
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-md border border-green-100">
            <div className="flex items-center gap-1 text-green-600 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-semibold">PREMIADOS</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              Top 3
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingHeader;
