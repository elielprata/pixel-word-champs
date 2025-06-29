
import React, { useMemo, useState, useEffect } from 'react';
import { Zap, Clock, Play } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Competition } from '@/types';

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
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        let text = '';
        if (days > 0) {
          text = `${days}d ${hours}h`;
        } else if (hours > 0) {
          text = `${hours}h ${minutes}m`;
        } else {
          text = `${minutes}m`;
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

  const CircularProgressWithTime = ({ percentage, timeText, size = 70 }: { percentage: number; timeText: string; size?: number }) => {
    const radius = (size - 6) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative flex flex-col items-center" style={{ width: size, height: size + 16 }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={status === 'active' ? 'text-green-500' : 'text-blue-500'}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {status === 'active' ? (
              <Zap className="w-4 h-4 mx-auto text-green-600 mb-0.5" />
            ) : (
              <Clock className="w-4 h-4 mx-auto text-blue-600 mb-0.5" />
            )}
            <div className="text-xs font-bold text-gray-700">
              {status === 'active' ? Math.round(percentage) + '%' : '⏰'}
            </div>
          </div>
        </div>
        <div className={`text-center mt-1 font-bold text-xs ${status === 'active' ? 'text-green-700' : 'text-blue-700'}`}>
          {timeText}
        </div>
      </div>
    );
  };

  return (
    <Card className={`relative border-0 bg-gradient-to-br ${bgGradient} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in group overflow-hidden`}>
      {/* Elementos decorativos gamificados */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-2 right-6 w-1 h-1 bg-blue-400/60 rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
        <div className="absolute top-5 right-10 w-1.5 h-1.5 bg-purple-400/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
        <div className="absolute bottom-6 left-4 w-1 h-1 bg-green-400/50 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
        
        <div className="absolute top-2 left-12 text-xs text-blue-400/50 animate-pulse font-bold" style={{ animationDelay: '0.3s', animationDuration: '4s' }}>⚡</div>
        <div className="absolute bottom-4 right-12 text-xs text-purple-400/40 animate-pulse font-bold" style={{ animationDelay: '2s', animationDuration: '3s' }}>🎮</div>
        <div className="absolute top-6 right-16 text-xs text-green-400/35 animate-pulse font-bold" style={{ animationDelay: '1.2s', animationDuration: '3.5s' }}>🏆</div>
      </div>

      <CardContent className="p-3 relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="p-1.5 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
              {status === 'active' ? (
                <Zap className="w-3.5 h-3.5 text-primary-foreground" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-primary-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
                {competition.title}
              </h3>
            </div>
          </div>
          
          <div className="shrink-0">
            <CircularProgressWithTime 
              percentage={timeRemaining.percentage} 
              timeText={timeRemaining.text}
              size={70} 
            />
          </div>
        </div>

        {status === 'active' && (
          <Button 
            onClick={() => onJoin(competition.id)} 
            className="w-full h-9 text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 transition-all duration-300 shadow-lg border-0"
            size="sm"
          >
            <Play className="w-3.5 h-3.5 mr-2" />
            🎮 PARTICIPAR AGORA
          </Button>
        )}

        {status === 'scheduled' && (
          <Button 
            disabled
            className="w-full h-9 text-sm font-bold bg-gradient-to-r from-blue-400 to-indigo-500 cursor-not-allowed opacity-75"
            size="sm"
          >
            <Clock className="w-3.5 h-3.5 mr-2" />
            📅 AGUARDANDO
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(CompetitionCard);
