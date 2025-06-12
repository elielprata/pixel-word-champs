
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
      return `${hours}h ${minutes}m restantes`;
    }
    return `${minutes}m restantes`;
  };

  if (status !== 'active') {
    return null; // Não mostrar competições inativas
  }

  return (
    <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        {/* Header com ícone e título */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-md">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground leading-tight">
              {competition.title}
            </h3>
            <p className="text-muted-foreground text-sm">
              Desafio Diário Épico
            </p>
          </div>
        </div>

        {/* Descrição */}
        {competition.description && (
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            {competition.description}
          </p>
        )}

        {/* Tempo restante */}
        <div className="bg-accent rounded-lg p-4 mb-6 border border-border">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold text-base">
              {calculateTimeRemaining()}
            </span>
          </div>
          <p className="text-center text-muted-foreground text-xs mt-1">
            ⏰ Corra contra o tempo!
          </p>
        </div>

        {/* Botão de ação único */}
        <Button 
          onClick={() => onJoin(competition.id)} 
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          🎯 Jogar Agora
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompetitionCard;
