
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
  // CONFIAR APENAS NO STATUS DO BANCO DE DADOS
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'completed': return 'Finalizada';
      case 'scheduled': return 'Agendada';
      default: return 'Indisponível';
    }
  };

  return (
    <div className="text-center mb-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🏆 Ranking Semanal
        </h1>
        <p className="text-gray-600">
          {weeklyCompetition ? getStatusText(weeklyCompetition.status) : 'Sem competição ativa'}
        </p>
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
                {getStatusText(weeklyCompetition.status)}
              </div>
              <div className="text-xs text-gray-500">Status</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingHeader;
