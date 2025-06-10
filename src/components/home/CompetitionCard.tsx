
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { gameService } from '@/services/gameService';
import { competitionParticipationService } from '@/services/competitionParticipationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { getBrasiliaTime, convertToBrasiliaTime } from '@/utils/brasiliaTime';

interface Competition {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
}

interface CompetitionCardProps {
  competition: Competition;
  onStartChallenge: (challengeId: string) => void;
}

const CompetitionCard = ({ competition, onStartChallenge }: CompetitionCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [hasParticipated, setHasParticipated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkParticipation();
  }, [user, competition.id]);

  const checkParticipation = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Verificar se o usuário já participou desta competição específica
      const response = await competitionParticipationService.hasUserParticipatedInCompetition(user.id, competition.id);
      if (response.success) {
        setHasParticipated(response.hasParticipated);
      }
    } catch (error) {
      console.error('Erro ao verificar participação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = (endDate: string) => {
    const brasiliaNow = getBrasiliaTime();
    const endBrasilia = convertToBrasiliaTime(new Date(endDate));
    const diff = endBrasilia.getTime() - brasiliaNow.getTime();
    
    if (diff <= 0) return 'Finalizada';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTimeColor = (endDate: string) => {
    const brasiliaNow = getBrasiliaTime();
    const endBrasilia = convertToBrasiliaTime(new Date(endDate));
    const diff = endBrasilia.getTime() - brasiliaNow.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours <= 1) return 'text-red-600';
    if (hours <= 6) return 'text-orange-600';
    return 'text-emerald-600';
  };

  const handleStartGame = async () => {
    if (hasParticipated) {
      toast({
        title: "Participação já realizada",
        description: "Você já participou desta competição.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🎮 Iniciando nova sessão de jogo...');
      
      const response = await gameService.createGameSession({
        level: 1,
        boardSize: 10,
        competitionId: competition.id
      });

      if (response.success) {
        console.log('✅ Sessão criada com sucesso:', response.data.id);
        toast({
          title: "Preparando jogo...",
          description: "Carregando as regras do jogo!",
        });
        
        // Marcar usuário como participante desta competição
        setHasParticipated(true);
        
        // Usar o ID completo da sessão (UUID)
        onStartChallenge(response.data.id);
      } else {
        console.error('❌ Erro ao criar sessão:', response.error);
        toast({
          title: "Erro",
          description: "Não foi possível iniciar o jogo. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao iniciar jogo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Verificando...";
    if (hasParticipated) return "JÁ PARTICIPOU";
    return "🎯 PARTICIPAR AGORA";
  };

  const getButtonVariant = () => {
    if (hasParticipated) return "secondary";
    return "default";
  };

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-amber-300">
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(217, 119, 6, 0.1) 15px, rgba(217, 119, 6, 0.1) 16px),
                           repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(217, 119, 6, 0.1) 15px, rgba(217, 119, 6, 0.1) 16px)`
        }}></div>
      </div>
      
      <CardContent className="relative p-4">
        <div className="space-y-4">
          {/* Header com tema */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-lg leading-tight">
              {competition.title}
            </h3>
            
            {competition.theme && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-sm px-3 py-1 shadow-md">
                📝 {competition.theme}
              </Badge>
            )}
          </div>

          {/* Tempo com design de tabuleiro */}
          <div className="flex items-center justify-center gap-2 bg-slate-50 rounded-lg p-2 text-center">
            <Clock className={`w-4 h-4 ${getTimeColor(competition.end_date)}`} />
            <div className="text-center">
              <span className="text-xs text-slate-600 block">Tempo restante</span>
              <span className={`text-sm font-bold ${getTimeColor(competition.end_date)}`}>
                {formatTimeRemaining(competition.end_date)}
              </span>
            </div>
          </div>

          {/* Botão de ação */}
          <Button 
            onClick={handleStartGame}
            disabled={hasParticipated || isLoading}
            variant={getButtonVariant()}
            className={`w-full font-bold text-sm py-3 rounded-lg shadow-md transition-all duration-200 border-2 ${
              hasParticipated 
                ? 'bg-gray-400 hover:bg-gray-400 text-gray-600 border-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white hover:shadow-lg border-amber-700/20'
            }`}
          >
            {getButtonText()}
          </Button>
        </div>
      </CardContent>
      
      {/* Corner decoration */}
      <div className="absolute top-2 right-2 w-3 h-3 bg-amber-400 rounded-full opacity-60"></div>
      <div className="absolute bottom-2 left-2 w-2 h-2 bg-orange-400 rounded-full opacity-60"></div>
    </Card>
  );
};

export default CompetitionCard;
