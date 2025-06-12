
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

const CompetitionCard = ({ competition, onJoin, onViewRanking }: CompetitionCardProps) => {
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
    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      {/* Efeitos visuais de fundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-pink-400/10"></div>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl"></div>
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-pink-400/20 rounded-full blur-xl"></div>
      
      <CardContent className="relative p-6 text-white">
        {/* Header com ícone de raio */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-400 rounded-xl shadow-lg">
            <Zap className="w-6 h-6 text-yellow-900" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-white leading-tight">
              {competition.title}
            </h3>
            <p className="text-blue-100 text-sm font-medium">
              Desafio Diário Épico
            </p>
          </div>
        </div>

        {/* Descrição */}
        {competition.description && (
          <p className="text-blue-100 text-sm mb-4 leading-relaxed">
            {competition.description}
          </p>
        )}

        {/* Tempo restante com destaque */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/10">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-lg">
              {calculateTimeRemaining()}
            </span>
          </div>
          <p className="text-center text-blue-200 text-xs mt-1">
            ⏰ Corra contra o tempo!
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3">
          <Button 
            onClick={() => onJoin(competition.id)} 
            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            🎯 Jogar Agora
          </Button>
          
          <Button 
            onClick={() => onViewRanking(competition.id)} 
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm font-semibold h-12 px-6 rounded-xl"
            size="lg"
          >
            🏆 Ranking
          </Button>
        </div>

        {/* Elemento decorativo */}
        <div className="absolute top-2 right-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionCard;
