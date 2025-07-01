
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

  // Usar os top 3 players do ranking semanal
  const topPlayers = weeklyStats?.top_3_players || [];

  return (
    <div className="mb-4">
      {/* Header Principal - Gradiente amarelo para laranja exatamente como na imagem */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 mb-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Competição Semanal</h3>
            <p className="text-white/90 text-sm">Prêmio: {(topPlayers[0]?.prize || 1000) + (topPlayers[1]?.prize || 500) + (topPlayers[2]?.prize || 250)} moedas</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
            <span className="text-white font-mono text-sm font-medium">{timeRemaining}</span>
          </div>
        </div>
      </div>

      {/* Cards de Prêmios - Fundo roxo/azul como na imagem */}
      <div className="flex gap-3">
        {/* 1º Lugar */}
        <div className="flex-1 bg-gradient-to-br from-purple-600/80 to-blue-700/80 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="mb-3">
            <Trophy className="w-8 h-8 mx-auto text-yellow-400" />
          </div>
          <h4 className="text-white font-bold text-base mb-2">1º Lugar</h4>
          <div className="flex items-center justify-center gap-1">
            <span className="text-yellow-400 font-bold text-lg">{topPlayers[0]?.prize || 1000}</span>
            <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-yellow-900">$</span>
            </div>
          </div>
        </div>

        {/* 2º Lugar */}
        <div className="flex-1 bg-gradient-to-br from-purple-600/80 to-blue-700/80 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="mb-3">
            <Medal className="w-8 h-8 mx-auto text-gray-300" />
          </div>
          <h4 className="text-white font-bold text-base mb-2">2º Lugar</h4>
          <div className="flex items-center justify-center gap-1">
            <span className="text-yellow-400 font-bold text-lg">{topPlayers[1]?.prize || 500}</span>
            <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-yellow-900">$</span>
            </div>
          </div>
        </div>

        {/* 3º Lugar */}
        <div className="flex-1 bg-gradient-to-br from-purple-600/80 to-blue-700/80 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="mb-3">
            <Award className="w-8 h-8 mx-auto text-orange-400" />
          </div>
          <h4 className="text-white font-bold text-base mb-2">3º Lugar</h4>
          <div className="flex items-center justify-center gap-1">
            <span className="text-yellow-400 font-bold text-lg">{topPlayers[2]?.prize || 250}</span>
            <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-yellow-900">$</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCompetitionCard;
