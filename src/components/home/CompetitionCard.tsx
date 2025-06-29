
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Competition } from '@/types';
import { CompetitionCardButton } from './CompetitionCardButton';

interface CompetitionCardProps {
  competition: Competition;
  onJoin: (competitionId: string) => void;
  onViewRanking: (competitionId: string) => void;
}

const CompetitionCard = ({ competition, onJoin }: CompetitionCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    text: string;
    percentage: number;
    totalSeconds: number;
  }>({ text: '', percentage: 0, totalSeconds: 0 });
  
  const status = competition.status as 'scheduled' | 'active' | 'completed';

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      
      if (status === 'scheduled') {
        const start = new Date(competition.start_date);
        const diff = start.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeRemaining({ text: 'Iniciando...', percentage: 100, totalSeconds: 0 });
          return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        let text = '';
        if (hours > 0) {
          text = `Inicia em ${hours}h ${minutes}m`;
        } else {
          text = `Inicia em ${minutes}m`;
        }
        
        setTimeRemaining({ text, percentage: 0, totalSeconds: Math.floor(diff / 1000) });
      } else if (status === 'active') {
        const start = new Date(competition.start_date);
        const end = new Date(competition.end_date);
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        const remaining = end.getTime() - now.getTime();
        
        if (remaining <= 0) {
          setTimeRemaining({ text: 'Finalizado', percentage: 100, totalSeconds: 0 });
          return;
        }
        
        const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        
        let text = '';
        if (hours > 0) {
          text = `${hours}h ${minutes}m`;
        } else {
          text = `${minutes}m`;
        }
        
        setTimeRemaining({ text, percentage, totalSeconds: Math.floor(remaining / 1000) });
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [status, competition.start_date, competition.end_date]);

  if (status === 'completed') {
    return null;
  }

  if (status === 'active') {
    return (
      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 shadow-lg border border-pink-200 relative overflow-hidden mb-3">
        {/* Decorações de fundo */}
        <div className="absolute top-2 right-2 opacity-20">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
            <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
          </div>
          <div className="flex space-x-1 mt-1">
            <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
            <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
            <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
          </div>
        </div>

        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-xl">⚡</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                {competition.title}
              </h3>
              <p className="text-gray-500 text-sm">
                Caça Palavras
              </p>
            </div>
          </div>
          
          {/* Indicador de progresso circular */}
          <div className="text-center">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-green-400"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${timeRemaining.percentage * 0.96}, 96`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-green-500 text-xs">⚡</span>
                  <div className="text-green-600 font-bold text-sm">
                    {Math.round(timeRemaining.percentage)}%
                  </div>
                </div>
              </div>
            </div>
            <div className="text-green-600 font-semibold text-sm mt-1">
              {timeRemaining.text}
            </div>
          </div>
        </div>

        <CompetitionCardButton
          status={status}
          competitionId={competition.id}
          onJoin={onJoin}
        />
      </div>
    );
  }

  // Card para competições agendadas (sem card wrapper individual)
  return (
    <div className="flex justify-between items-center py-4">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 ${
          competition.type === 'weekly' ? 'bg-blue-500' : 'bg-orange-500'
        } rounded-lg flex items-center justify-center`}>
          <span className="text-white">
            {competition.type === 'weekly' ? '🏆' : '🔥'}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">
            {competition.title}
          </h3>
          <p className="text-gray-500 text-sm">
            {timeRemaining.text}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-bold ${
          competition.type === 'weekly' ? 'text-blue-600' : 'text-orange-600'
        }`}>
          {competition.prize_pool} pts
        </div>
        <div className="text-gray-400 text-xs">Prêmio</div>
      </div>
    </div>
  );
};

export default React.memo(CompetitionCard);
