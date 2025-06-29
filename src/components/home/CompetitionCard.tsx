
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Competition } from '@/types';
import { CompetitionCardHeader } from './CompetitionCardHeader';
import { CompetitionCardContent } from './CompetitionCardContent';
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
    const colors = [
      'from-purple-50/90 to-indigo-100/70',
      'from-blue-50/90 to-cyan-100/70', 
      'from-green-50/90 to-emerald-100/70',
      'from-pink-50/90 to-rose-100/70',
      'from-yellow-50/90 to-amber-100/70',
      'from-orange-50/90 to-red-100/70',
      'from-teal-50/90 to-blue-100/70',
      'from-violet-50/90 to-purple-100/70'
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

  return (
    <Card className={`relative border-0 bg-gradient-to-br ${bgGradient} backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-fade-in group overflow-hidden`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-3 right-6 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-6 right-10 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-4 left-6 w-1 h-1 bg-green-400/40 rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        
        <div className="absolute top-3 left-16 text-lg text-blue-400/30 animate-pulse font-bold" style={{ animationDelay: '0.5s', animationDuration: '5s' }}>⚡</div>
        <div className="absolute bottom-3 right-16 text-lg text-purple-400/25 animate-pulse font-bold" style={{ animationDelay: '2.5s', animationDuration: '4s' }}>🎮</div>
        <div className="absolute top-8 right-20 text-lg text-green-400/20 animate-pulse font-bold" style={{ animationDelay: '1.5s', animationDuration: '6s' }}>🏆</div>
      </div>

      <CardContent className="p-4 relative">
        <CompetitionCardHeader
          title={competition.title}
          status={status}
          timeRemaining={timeRemaining}
        />

        <CompetitionCardContent
          description={competition.description}
          theme={competition.theme}
          totalParticipants={competition.total_participants}
          maxParticipants={competition.max_participants}
        />

        <CompetitionCardButton
          status={status}
          competitionId={competition.id}
          onJoin={onJoin}
        />
      </CardContent>
    </Card>
  );
};

export default React.memo(CompetitionCard);
