
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
    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl p-3 shadow-md mb-4">
      {/* Header Compacto */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <Trophy className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm">Competição Semanal</h3>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
          <span className="text-white font-mono text-xs">{timeRemaining}</span>
        </div>
      </div>

      {/* Prêmios em linha compacta */}
      <div className="flex justify-between gap-2">
        {/* 1º Lugar */}
        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
          <div className="w-5 h-5 mx-auto mb-1 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded flex items-center justify-center">
            <Trophy className="w-2.5 h-2.5 text-yellow-900" />
          </div>
          <p className="text-white text-[10px] font-medium">1º</p>
          <p className="text-yellow-200 text-[10px] flex items-center justify-center gap-1">
            <span className="font-semibold">{topPlayers[0]?.prize || 1000}</span>
            <span className="w-2 h-2 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[6px] font-bold text-yellow-900">$</span>
            </span>
          </p>
        </div>

        {/* 2º Lugar */}
        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
          <div className="w-5 h-5 mx-auto mb-1 bg-gradient-to-br from-gray-300 to-gray-500 rounded flex items-center justify-center">
            <Trophy className="w-2.5 h-2.5 text-gray-700" />
          </div>
          <p className="text-white text-[10px] font-medium">2º</p>
          <p className="text-yellow-200 text-[10px] flex items-center justify-center gap-1">
            <span className="font-semibold">{topPlayers[1]?.prize || 500}</span>
            <span className="w-2 h-2 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[6px] font-bold text-yellow-900">$</span>
            </span>
          </p>
        </div>

        {/* 3º Lugar */}
        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
          <div className="w-5 h-5 mx-auto mb-1 bg-gradient-to-br from-orange-400 to-orange-600 rounded flex items-center justify-center">
            <Trophy className="w-2.5 h-2.5 text-orange-800" />
          </div>
          <p className="text-white text-[10px] font-medium">3º</p>
          <p className="text-yellow-200 text-[10px] flex items-center justify-center gap-1">
            <span className="font-semibold">{topPlayers[2]?.prize || 250}</span>
            <span className="w-2 h-2 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[6px] font-bold text-yellow-900">$</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyCompetitionCard;
