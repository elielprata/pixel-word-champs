
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
  
  // Gerar cor de fundo baseada no ID da competição para consistência
  const getBackgroundColor = (id: string) => {
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
    
    const hash = id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  const calculateTimeRemaining = () => {
    // CORREÇÃO RADICAL: Calcular tempo restante usando horário de Brasília
    const now = new Date();
    const endDate = new Date(competition.end_date);
    
    // Como o banco agora armazena as datas em UTC correspondente ao horário de Brasília,
    // podemos fazer a comparação diretamente
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

  const bgGradient = getBackgroundColor(competition.id);

  return (
    <Card className={`relative border-0 bg-gradient-to-br ${bgGradient} backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] animate-fade-in group overflow-hidden`}>
      {/* Elementos flutuantes coloridos com diferentes tamanhos e animações */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Bolinhas pequenas */}
        <div className="absolute top-2 right-8 w-1 h-1 bg-blue-400/70 rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
        <div className="absolute top-6 right-12 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
        <div className="absolute bottom-8 left-6 w-1 h-1 bg-green-400/60 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
        <div className="absolute bottom-4 right-6 w-0.5 h-0.5 bg-pink-400/70 rounded-full animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '2s' }}></div>
        <div className="absolute top-12 left-4 w-2 h-2 bg-orange-400/50 rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-12 right-4 w-1 h-1 bg-cyan-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.8s', animationDuration: '3.5s' }}></div>
        
        {/* Bolinhas médias */}
        <div className="absolute top-4 left-12 w-2.5 h-2.5 bg-indigo-300/40 rounded-full animate-pulse" style={{ animationDelay: '1.2s', animationDuration: '4.5s' }}></div>
        <div className="absolute bottom-6 left-16 w-2 h-2 bg-teal-300/50 rounded-full animate-pulse" style={{ animationDelay: '2.5s', animationDuration: '3.2s' }}></div>
        
        {/* Símbolos coloridos */}
        <div className="absolute top-3 left-16 text-xs text-blue-400/60 animate-pulse font-bold" style={{ animationDelay: '0.3s', animationDuration: '4s' }}>★</div>
        <div className="absolute bottom-6 right-16 text-xs text-purple-400/50 animate-pulse font-bold" style={{ animationDelay: '2s', animationDuration: '3s' }}>◆</div>
        <div className="absolute top-8 right-20 text-xs text-green-400/45 animate-pulse font-bold" style={{ animationDelay: '1.2s', animationDuration: '3.5s' }}>♦</div>
        <div className="absolute bottom-10 left-8 text-sm text-pink-400/40 animate-pulse font-bold" style={{ animationDelay: '3s', animationDuration: '5s' }}>★</div>
        <div className="absolute top-14 right-8 text-xs text-orange-400/55 animate-pulse font-bold" style={{ animationDelay: '0.7s', animationDuration: '2.8s' }}>◆</div>
        <div className="absolute bottom-14 right-12 text-xs text-cyan-400/45 animate-pulse font-bold" style={{ animationDelay: '1.8s', animationDuration: '4.2s' }}>♦</div>
      </div>

      <CardContent className="p-4 relative">
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
            </div>
          </div>
          
          {/* Tempo restante compacto - CORRIGIDO para Brasília */}
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
