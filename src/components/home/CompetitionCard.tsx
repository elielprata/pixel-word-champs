
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Competition } from '@/types';
import { CompetitionCardHeader } from './CompetitionCardHeader';
import { CompetitionCardButton } from './CompetitionCardButton';
import { CompetitionCardDecorations } from './CompetitionCardDecorations';

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

  return (
    <Card className={`relative border-0 bg-gradient-to-br ${bgGradient} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in group overflow-hidden`}>
      <CompetitionCardDecorations />

      <CardContent className="p-3 relative">
        <CompetitionCardHeader
          title={competition.title}
          status={status}
          timeRemaining={timeRemaining}
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
