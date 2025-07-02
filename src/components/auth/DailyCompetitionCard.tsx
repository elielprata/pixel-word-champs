
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
  
  // Usar dados reais dos prêmios da função weekly stats
  const getPrizeAmount = (position: number) => {
    // Primeiro tenta pegar dos dados já carregados em weeklyStats
    const playerData = topPlayers.find(p => p.position === position);
    if (playerData?.prize) return playerData.prize;
    
    // Fallback para valores padrão baseados nos dados reais
    const fallbackPrizes = { 1: 200, 2: 100, 3: 50 };
    return fallbackPrizes[position as keyof typeof fallbackPrizes] || 0;
  };

  return (
    <div className="mb-2">
      {/* Header Principal */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-3 mb-2 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-base mb-0 drop-shadow">🏆 Competição Semanal</h3>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/20">
            <span className="text-white font-mono text-sm font-bold drop-shadow">{timeRemaining}</span>
          </div>
        </div>
      </div>

      {/* Cards de Prêmios */}
      <div className="flex gap-2">
        {/* 1º Lugar */}
        <div className="flex-1 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 rounded-xl p-2.5 text-center shadow-md border border-yellow-300/50">
          <div className="mb-1">
            <Trophy className="w-5 h-5 mx-auto text-yellow-900" />
          </div>
          <h4 className="text-yellow-900 font-bold text-[10px] mb-1">1º LUGAR</h4>
          <div className="flex items-center justify-center">
            <span className="text-yellow-900 font-bold text-sm">R$ {getPrizeAmount(1)}</span>
          </div>
        </div>

        {/* 2º Lugar */}
        <div className="flex-1 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-xl p-2.5 text-center shadow-md border border-gray-300/50">
          <div className="mb-1">
            <Medal className="w-5 h-5 mx-auto text-gray-700" />
          </div>
          <h4 className="text-gray-800 font-bold text-[10px] mb-1">2º LUGAR</h4>
          <div className="flex items-center justify-center">
            <span className="text-gray-800 font-bold text-sm">R$ {getPrizeAmount(2)}</span>
          </div>
        </div>

        {/* 3º Lugar */}
        <div className="flex-1 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-xl p-2.5 text-center shadow-md border border-orange-300/50">
          <div className="mb-1">
            <Award className="w-5 h-5 mx-auto text-orange-900" />
          </div>
          <h4 className="text-orange-900 font-bold text-[10px] mb-1">3º LUGAR</h4>
          <div className="flex items-center justify-center">
            <span className="text-orange-900 font-bold text-sm">R$ {getPrizeAmount(3)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCompetitionCard;
