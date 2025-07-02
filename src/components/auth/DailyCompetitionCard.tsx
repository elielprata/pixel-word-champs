
import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { useAdvancedWeeklyStats } from '@/hooks/useAdvancedWeeklyStats';
import { usePrizeConfigurations } from '@/hooks/usePrizeConfigurations';

const DailyCompetitionCard = () => {
  const [timeRemaining, setTimeRemaining] = useState('--:--:--');
  const { data: weeklyStats } = useAdvancedWeeklyStats();
  const { data: prizeConfigs } = usePrizeConfigurations();

  useEffect(() => {
    const updateTimer = () => {
      if (!weeklyStats?.current_week_end) {
        setTimeRemaining('--:--:--');
        return;
      }

      const now = new Date();
      const endDate = new Date(weeklyStats.current_week_end + 'T23:59:59');
      const diff = endDate.getTime() - now.getTime();
      
      if (diff > 0) {
        const totalHours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(totalHours / 24);
        const hours = totalHours % 24;
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (days > 0) {
          setTimeRemaining(`${days}D ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      } else {
        setTimeRemaining('00:00:00');
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [weeklyStats?.current_week_end]);

  const topPlayers = weeklyStats?.top_3_players || [];
  
  // Buscar prêmios reais ou usar fallback
  const getPrizeAmount = (position: number) => {
    const prizeConfig = prizeConfigs?.find(p => p.position === position);
    return prizeConfig?.prize_amount || 0;
  };

  return (
    <div className="mb-2">
      {/* Header Principal */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 rounded-2xl p-3 mb-2 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg mb-0 drop-shadow">🏆 Competição Semanal</h3>
          </div>
          <div className="bg-white/25 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
            <span className="text-white font-mono text-sm font-bold drop-shadow">{timeRemaining}</span>
          </div>
        </div>
      </div>

      {/* Cards de Prêmios */}
      <div className="flex gap-2">
        {/* 1º Lugar */}
        <div className="flex-1 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-2xl p-3 text-center shadow-lg border border-yellow-300/30">
          <div className="mb-1">
            <Trophy className="w-6 h-6 mx-auto text-yellow-900 drop-shadow" />
          </div>
          <h4 className="text-yellow-900 font-bold text-xs mb-1">1º Lugar</h4>
          <div className="flex items-center justify-center gap-1">
            <span className="text-yellow-900 font-bold text-base">R$ {getPrizeAmount(1)}</span>
          </div>
        </div>

        {/* 2º Lugar */}
        <div className="flex-1 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-2xl p-3 text-center shadow-lg border border-gray-200/30">
          <div className="mb-1">
            <Medal className="w-6 h-6 mx-auto text-gray-700 drop-shadow" />
          </div>
          <h4 className="text-gray-800 font-bold text-xs mb-1">2º Lugar</h4>
          <div className="flex items-center justify-center gap-1">
            <span className="text-gray-800 font-bold text-base">R$ {getPrizeAmount(2)}</span>
          </div>
        </div>

        {/* 3º Lugar */}
        <div className="flex-1 bg-gradient-to-br from-orange-400 via-amber-600 to-orange-600 rounded-2xl p-3 text-center shadow-lg border border-orange-300/30">
          <div className="mb-1">
            <Award className="w-6 h-6 mx-auto text-orange-900 drop-shadow" />
          </div>
          <h4 className="text-orange-900 font-bold text-xs mb-1">3º Lugar</h4>
          <div className="flex items-center justify-center gap-1">
            <span className="text-orange-900 font-bold text-base">R$ {getPrizeAmount(3)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCompetitionCard;
