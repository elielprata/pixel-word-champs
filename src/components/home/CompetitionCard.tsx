
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Competition } from '@/types';
import { CompetitionCardHeader } from './CompetitionCardHeader';
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
  
  const bgGradient = useMemo(() => {
    if (status === 'active') {
      return 'from-purple-50/90 to-purple-100/70 border-purple-200/50';
    } else {
      return 'from-orange-50/90 to-orange-100/70 border-orange-200/50';
    }
  }, [status]);

  const iconBg = useMemo(() => {
    if (status === 'active') {
      return 'bg-gradient-to-br from-purple-500 to-purple-600';
    } else {
      return 'bg-gradient-to-br from-orange-500 to-orange-600';
    }
  }, [status]);

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

  return (
    <Card className={`border bg-gradient-to-br ${bgGradient} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Ícone da competição */}
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            {status === 'active' ? (
              <span className="text-white text-lg font-bold">⚡</span>
            ) : (
              <span className="text-white text-lg font-bold">📅</span>
            )}
          </div>

          {/* Conteúdo da competição */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-base text-slate-800 mb-1 line-clamp-1">
                  {competition.title}
                </h3>
                <p className="text-sm text-slate-600 mb-2">
                  {competition.description || 'Caça Palavras'}
                </p>
                <p className="text-xs text-slate-500">
                  {timeRemaining.text}
                </p>
              </div>

              {/* Indicador de progresso (apenas para ativas) */}
              {status === 'active' && (
                <div className="text-right flex-shrink-0">
                  <div className="w-12 h-12 relative">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-green-500"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${timeRemaining.percentage}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-green-600">
                        {Math.round(timeRemaining.percentage)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botão de ação */}
            <div className="mt-3">
              <CompetitionCardButton
                status={status}
                competitionId={competition.id}
                onJoin={onJoin}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(CompetitionCard);
