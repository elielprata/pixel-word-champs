
import React, { useMemo, useState, useEffect } from 'react';
import { Zap, Clock, Play, Calendar, Trophy } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Competition } from '@/types';
import { CompetitionStatusBadge } from '@/components/CompetitionStatusBadge';
import { formatDateTimeBrasilia } from '@/utils/dynamicCompetitionStatus';

interface CompetitionCardProps {
  competition: Competition;
  onJoin: (competitionId: string) => void;
  onViewRanking: (competitionId: string) => void;
}

const CompetitionCard = ({ competition, onJoin }: CompetitionCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  // Confiar completamente no status do banco de dados
  const status = competition.status as 'scheduled' | 'active' | 'completed';
  
  const bgGradient = useMemo(() => {
    const colors = [
      'from-blue-50/80 to-indigo-100/60',
      'from-purple-50/80 to-violet-100/60', 
      'from-pink-50/80 to-rose-100/60',
      'from-green-50/80 to-emerald-100/60',
      'from-yellow-50/80 to-amber-100/60',
      'from-orange-50/80 to-red-100/60',
      'from-teal-50/80 to-cyan-100/60',
      'from-slate-50/80 to-gray-100/60'
    ];
    
    const hash = competition.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }, [competition.id]);

  // Timer regressivo para competições agendadas
  useEffect(() => {
    if (status === 'scheduled') {
      const updateTimer = () => {
        const now = new Date();
        const start = new Date(competition.start_date);
        const diff = start.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeRemaining('Iniciando...');
          return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setTimeRemaining(`${minutes}m`);
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Atualiza a cada minuto
      
      return () => clearInterval(interval);
    }
  }, [status, competition.start_date]);

  // Só mostrar competições ativas ou agendadas
  if (status === 'completed') {
    return null;
  }

  return (
    <Card className={`relative border-0 bg-gradient-to-br ${bgGradient} backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] animate-fade-in group overflow-hidden`}>
      {/* Elementos flutuantes gamificados */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Partículas animadas */}
        <div className="absolute top-2 right-8 w-1 h-1 bg-blue-400/70 rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
        <div className="absolute top-6 right-12 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
        <div className="absolute bottom-8 left-6 w-1 h-1 bg-green-400/60 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
        <div className="absolute bottom-4 right-6 w-0.5 h-0.5 bg-pink-400/70 rounded-full animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '2s' }}></div>
        <div className="absolute top-12 left-4 w-2 h-2 bg-orange-400/50 rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
        
        {/* Símbolos gamificados */}
        <div className="absolute top-3 left-16 text-xs text-blue-400/60 animate-pulse font-bold" style={{ animationDelay: '0.3s', animationDuration: '4s' }}>⚡</div>
        <div className="absolute bottom-6 right-16 text-xs text-purple-400/50 animate-pulse font-bold" style={{ animationDelay: '2s', animationDuration: '3s' }}>🎮</div>
        <div className="absolute top-8 right-20 text-xs text-green-400/45 animate-pulse font-bold" style={{ animationDelay: '1.2s', animationDuration: '3.5s' }}>🏆</div>
        <div className="absolute bottom-10 left-8 text-sm text-pink-400/40 animate-pulse font-bold" style={{ animationDelay: '3s', animationDuration: '5s' }}>💎</div>
      </div>

      <CardContent className="p-4 relative">
        {/* Header gamificado */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              {status === 'active' ? (
                <Zap className="w-4 h-4 text-primary-foreground animate-pulse" />
              ) : (
                <Clock className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
                {competition.title}
              </h3>
              <div className="mt-1">
                <CompetitionStatusBadge 
                  status={status} 
                  isRealTime={status === 'active'} 
                  isStatusOutdated={false}
                  calculatedStatus={status}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Descrição compacta */}
        {competition.description && (
          <p className="text-muted-foreground text-xs mb-3 leading-relaxed line-clamp-2 animate-fade-in delay-100">
            {competition.description}
          </p>
        )}

        {/* Timer regressivo para competições agendadas */}
        {status === 'scheduled' && timeRemaining && (
          <div className="mb-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 rounded-xl">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <div className="text-center">
                <div className="text-blue-700 font-bold text-sm">⏰ Inicia em:</div>
                <div className="text-blue-800 font-bold text-lg animate-pulse">{timeRemaining}</div>
              </div>
            </div>
          </div>
        )}

        {/* Informações de período simplificadas */}
        <div className="mb-3 p-2 bg-slate-50/80 border border-slate-200/50 rounded-lg text-xs">
          <div className="text-slate-700">
            <div className="font-medium flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Período da Competição:
            </div>
            <div className="text-slate-600 mt-1 text-xs">
              {formatDateTimeBrasilia(competition.start_date)} até {formatDateTimeBrasilia(competition.end_date)}
            </div>
          </div>
        </div>

        {/* Botão de ação gamificado */}
        {status === 'active' && (
          <Button 
            onClick={() => onJoin(competition.id)} 
            className="w-full h-10 text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 transition-all duration-300 animate-bounce-in delay-300 group/button shadow-lg border-0"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2 group-hover/button:scale-110 transition-transform duration-200" />
            <span className="group-hover/button:animate-pulse flex items-center gap-1">
              ⚡ JOGAR AGORA ⚡
            </span>
          </Button>
        )}

        {status === 'scheduled' && (
          <Button 
            disabled
            className="w-full h-10 text-sm font-bold bg-gradient-to-r from-blue-400 to-indigo-500 cursor-not-allowed opacity-75"
            size="sm"
          >
            <Clock className="w-4 h-4 mr-2" />
            <span className="flex items-center gap-1">
              🎮 AGUARDANDO INÍCIO
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(CompetitionCard);
