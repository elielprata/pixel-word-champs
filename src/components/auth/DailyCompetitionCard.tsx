
import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { useAdvancedWeeklyStats } from '@/hooks/useAdvancedWeeklyStats';

const DailyCompetitionCard = () => {
  const [timeRemaining, setTimeRemaining] = useState('--:--:--');
  const { data: weeklyStats } = useAdvancedWeeklyStats();

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

  // Usar os top 3 players do ranking semanal
  const topPlayers = weeklyStats?.top_3_players || [];

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 rounded-2xl p-4 shadow-lg mb-4">
      {/* Header da Competição - Tom mais dourado */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-white font-bold text-lg drop-shadow-md">Competição Diária</h3>
        </div>
        <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-300/30">
          <span className="text-white font-mono font-bold text-lg drop-shadow-md">{timeRemaining}</span>
        </div>
      </div>

      {/* Posições do Ranking - Cards mais escuros/contrastantes */}
      <div className="grid grid-cols-3 gap-3">
        {/* 1º Lugar */}
        <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 text-center border border-yellow-400/20">
          <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
            <Trophy className="w-5 h-5 text-yellow-900" />
          </div>
          <p className="text-white text-xs font-semibold">1º Lugar</p>
          <p className="text-yellow-200 text-xs mt-1 flex items-center justify-center">
            <span className="text-yellow-300 mr-1 font-bold">{topPlayers[0]?.prize || 1000}</span>
            <span className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[8px] font-bold text-yellow-900">$</span>
            </span>
          </p>
        </div>

        {/* 2º Lugar */}
        <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-400/20">
          <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-gray-300 to-gray-500 rounded-lg flex items-center justify-center shadow-lg">
            <Trophy className="w-5 h-5 text-gray-700" />
          </div>
          <p className="text-white text-xs font-semibold">2º Lugar</p>
          <p className="text-yellow-200 text-xs mt-1 flex items-center justify-center">
            <span className="text-yellow-300 mr-1 font-bold">{topPlayers[1]?.prize || 500}</span>
            <span className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[8px] font-bold text-yellow-900">$</span>
            </span>
          </p>
        </div>

        {/* 3º Lugar */}
        <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 text-center border border-orange-400/20">
          <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
            <Trophy className="w-5 h-5 text-orange-800" />
          </div>
          <p className="text-white text-xs font-semibold">3º Lugar</p>
          <p className="text-yellow-200 text-xs mt-1 flex items-center justify-center">
            <span className="text-yellow-300 mr-1 font-bold">{topPlayers[2]?.prize || 250}</span>
            <span className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[8px] font-bold text-yellow-900">$</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyCompetitionCard;
