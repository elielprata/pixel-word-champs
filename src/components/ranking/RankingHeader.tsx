
import React from 'react';
import { Trophy, Clock, Users } from 'lucide-react';

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
    <div className="text-center mb-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🏆 Ranking Semanal
        </h1>
        <p className="text-gray-600">Competição em andamento</p>
      </div>

      {weeklyCompetition && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                R$ {weeklyCompetition.prize_pool.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">Prêmio Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {formatTimeRemaining()}
              </div>
              <div className="text-xs text-gray-500">Restante</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingHeader;
