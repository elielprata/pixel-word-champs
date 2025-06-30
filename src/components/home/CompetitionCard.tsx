import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Competition } from '@/types';
import { CompetitionCardButton } from './CompetitionCardButton';
import { getCompetitionIconConfig } from '@/utils/competitionIcons';

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
  
  // Obter configuração de ícone única baseada no ID da competição
  const iconConfig = useMemo(() => {
    return getCompetitionIconConfig(competition.id);
  }, [competition.id]);

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
    const IconComponent = iconConfig.icon;
    
    return (
      <div className={`${iconConfig.colors.background} rounded-2xl p-4 shadow-lg ${iconConfig.colors.border} border relative overflow-hidden mb-3`}>
        {/* Decorações de fundo */}
        <div className="absolute top-2 right-2 opacity-20">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
          </div>
          <div className="flex space-x-1 mt-1">
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
          </div>
        </div>

        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${iconConfig.colors.primary} rounded-xl flex items-center justify-center shadow-md`}>
              <IconComponent className="text-white text-xl w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                {competition.title}
              </h3>
              <p className="text-gray-500 text-sm">
                {competition.description || 'Caça Palavras'}
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
                  <IconComponent className="text-green-500 w-4 h-4 mx-auto mb-1" />
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
  const IconComponent = iconConfig.icon;
  
  return (
    <div className="flex justify-between items-center py-4">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 ${iconConfig.colors.primary} rounded-lg flex items-center justify-center shadow-sm`}>
          <IconComponent className="text-white w-5 h-5" />
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
    </div>
  );
};

export default React.memo(CompetitionCard);
