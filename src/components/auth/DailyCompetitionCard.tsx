
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
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-2 mb-2 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-sm drop-shadow">🏆 Competição Semanal</h3>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-white font-mono text-xs font-bold drop-shadow">{timeRemaining}</span>
          </div>
        </div>
      </div>

      {/* Cards de Prêmios */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
          <Trophy className="text-yellow-400 text-lg mb-1 mx-auto" />
          <p className="text-white text-xs font-medium">1º Lugar</p>
          <p className="text-yellow-400 text-xs">{getPrizeAmount(1)} 💰</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
          <Medal className="text-gray-300 text-lg mb-1 mx-auto" />
          <p className="text-white text-xs font-medium">2º Lugar</p>
          <p className="text-yellow-400 text-xs">{getPrizeAmount(2)} 💰</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
          <Award className="text-orange-400 text-lg mb-1 mx-auto" />
          <p className="text-white text-xs font-medium">3º Lugar</p>
          <p className="text-yellow-400 text-xs">{getPrizeAmount(3)} 💰</p>
        </div>
      </div>
    </div>
  );
};

export default DailyCompetitionCard;
