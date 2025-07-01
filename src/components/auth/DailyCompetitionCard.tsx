
import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
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

  const topPlayers = weeklyStats?.top_3_players || [];

  return (
    <div className="mb-1">
      {/* Header Principal - Muito compacto */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-1.5 mb-0.5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-sm mb-0">Competição Semanal</h3>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-0.5">
            <span className="text-white font-mono text-xs font-medium">{timeRemaining}</span>
          </div>
        </div>
      </div>

      {/* Cards de Prêmios - Altura mínima absoluta */}
      <div className="flex gap-1">
        {/* 1º Lugar */}
        <div className="flex-1 bg-gradient-to-br from-purple-600/90 to-blue-700/90 backdrop-blur-sm rounded-xl p-1 text-center">
          <div className="mb-0">
            <Trophy className="w-4 h-4 mx-auto text-yellow-400" />
          </div>
          <h4 className="text-white font-bold text-[9px] mb-0.5">1º Lugar</h4>
          <div className="flex items-center justify-center gap-0.5">
            <span className="text-yellow-400 font-bold text-xs">{topPlayers[0]?.prize || 1000}</span>
            <div className="w-2 h-2 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[7px] font-bold text-yellow-900">$</span>
            </div>
          </div>
        </div>

        {/* 2º Lugar */}
        <div className="flex-1 bg-gradient-to-br from-purple-600/90 to-blue-700/90 backdrop-blur-sm rounded-xl p-1 text-center">
          <div className="mb-0">
            <Medal className="w-4 h-4 mx-auto text-gray-300" />
          </div>
          <h4 className="text-white font-bold text-[9px] mb-0.5">2º Lugar</h4>
          <div className="flex items-center justify-center gap-0.5">
            <span className="text-yellow-400 font-bold text-xs">{topPlayers[1]?.prize || 500}</span>
            <div className="w-2 h-2 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[7px] font-bold text-yellow-900">$</span>
            </div>
          </div>
        </div>

        {/* 3º Lugar */}
        <div className="flex-1 bg-gradient-to-br from-purple-600/90 to-blue-700/90 backdrop-blur-sm rounded-xl p-1 text-center">
          <div className="mb-0">
            <Award className="w-4 h-4 mx-auto text-orange-400" />
          </div>
          <h4 className="text-white font-bold text-[9px] mb-0.5">3º Lugar</h4>
          <div className="flex items-center justify-center gap-0.5">
            <span className="text-yellow-400 font-bold text-xs">{topPlayers[2]?.prize || 250}</span>
            <div className="w-2 h-2 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[7px] font-bold text-yellow-900">$</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCompetitionCard;
