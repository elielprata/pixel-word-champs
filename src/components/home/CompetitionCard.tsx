
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

  return (
    <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden mb-3">
      <CardContent className="p-4">
        {status === 'active' ? (
          // Layout para competições ativas (idêntico à imagem)
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">⚡</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {competition.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {competition.description || 'Caça Palavras'}
                  </p>
                </div>
              </div>
              
              {/* Indicador de progresso circular - posição igual à imagem */}
              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12">
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
                <p className="text-xs font-medium text-gray-600 mt-1">
                  {timeRemaining.text}
                </p>
              </div>
            </div>

            <CompetitionCardButton
              status={status}
              competitionId={competition.id}
              onJoin={onJoin}
            />
          </div>
        ) : (
          // Layout para competições agendadas (idêntico à imagem)
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🔥</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {competition.title}
                </h3>
                <p className="text-gray-500 text-sm">
                  {timeRemaining.text}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(CompetitionCard);
