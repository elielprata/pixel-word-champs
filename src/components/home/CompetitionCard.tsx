
import React from 'react';
import { Zap, Clock, Play } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Competition } from '@/types';
import { calculateCompetitionStatus } from '@/utils/brasiliaTime';

interface CompetitionCardProps {
  competition: Competition;
  onJoin: (competitionId: string) => void;
  onViewRanking: (competitionId: string) => void;
}

const CompetitionCard = ({ competition, onJoin }: CompetitionCardProps) => {
  const status = calculateCompetitionStatus(competition.start_date, competition.end_date);
  
  const calculateTimeRemaining = () => {
    const now = new Date();
    const endDate = new Date(competition.end_date);
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizada';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (status !== 'active') {
    return null;
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] animate-fade-in group overflow-hidden">
      <CardContent className="p-4">
        {/* Header compacto */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300 animate-bounce-in">
              <Zap className="w-4 h-4 text-primary-foreground animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
                {competition.title}
              </h3>
              <p className="text-muted-foreground text-xs animate-fade-in">
                🎮 Desafio Épico
              </p>
            </div>
          </div>
          
          {/* Tempo restante compacto */}
          <div className="bg-gradient-to-r from-accent/80 to-accent/60 rounded-lg px-3 py-1.5 border border-border/50 hover:from-primary/15 hover:to-primary/10 transition-all duration-300 animate-scale-in">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-primary font-bold text-sm animate-fade-in">
                {calculateTimeRemaining()}
              </span>
            </div>
          </div>
        </div>

        {/* Descrição compacta */}
        {competition.description && (
          <p className="text-muted-foreground text-xs mb-3 leading-relaxed line-clamp-2 animate-fade-in delay-100">
            {competition.description}
          </p>
        )}

        {/* Barra de progresso gamificada */}
        <div className="mb-3 animate-fade-in delay-150">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">⚡ Energia</span>
            <span className="text-primary font-semibold">100%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Botão de ação compacto e gamificado */}
        <Button 
          onClick={() => onJoin(competition.id)} 
          className="w-full h-9 text-sm font-bold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:scale-105 transition-all duration-300 animate-bounce-in delay-300 group/button shadow-lg"
          size="sm"
        >
          <Play className="w-4 h-4 mr-2 group-hover/button:scale-110 transition-transform duration-200" />
          <span className="group-hover/button:animate-pulse">🚀 JOGAR</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompetitionCard;
