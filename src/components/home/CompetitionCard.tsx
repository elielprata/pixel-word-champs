import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { gameService } from '@/services/gameService';
import { competitionParticipationService } from '@/services/competitionParticipationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { utcToBrasilia, brasiliaToUtc, formatBrasiliaTime } from '@/utils/brasiliaTime';
import { getCompetitionTheme, getCategoryEmoji } from '@/utils/competitionThemes';

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
  const [timeRemaining, setTimeRemaining] = useState('');

  // Obter tema baseado na categoria/theme da competição
  const theme = getCompetitionTheme(competition.theme);
  const categoryEmoji = getCategoryEmoji(competition.theme);

  useEffect(() => {
    checkParticipation();
  }, [user, competition.id]);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = formatTimeRemaining(competition.end_date);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [competition.end_date]);

  const checkParticipation = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
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
    const now = new Date();
    const endUtc = new Date(endDate);
    const endBrasilia = utcToBrasilia(endUtc);
    const adjustedEndBrasilia = new Date(endBrasilia);
    adjustedEndBrasilia.setHours(23, 59, 59, 999);
    const adjustedEndUtc = brasiliaToUtc(adjustedEndBrasilia);
    const diff = adjustedEndUtc.getTime() - now.getTime();
    
    console.log('🕐 Comparação de tempo (Brasília):', {
      nowUtc: now.toISOString(),
      nowBrasilia: formatBrasiliaTime(now),
      endOriginalUtc: endUtc.toISOString(),
      endBrasilia: formatBrasiliaTime(endBrasilia),
      endAdjustedBrasilia: formatBrasiliaTime(adjustedEndBrasilia),
      endAdjustedUtc: adjustedEndUtc.toISOString(),
      diff: diff,
      diffInHours: diff / (1000 * 60 * 60),
      diffInMinutes: diff / (1000 * 60)
    });
    
    if (diff <= 0) return 'Finalizada';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getTimeColor = (endDate: string) => {
    const now = new Date();
    const endUtc = new Date(endDate);
    const endBrasilia = utcToBrasilia(endUtc);
    const adjustedEndBrasilia = new Date(endBrasilia);
    adjustedEndBrasilia.setHours(23, 59, 59, 999);
    const adjustedEndUtc = brasiliaToUtc(adjustedEndBrasilia);
    const diff = adjustedEndUtc.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours <= 1) return theme.timeColors.urgent;
    if (hours <= 6) return theme.timeColors.warning;
    return theme.timeColors.safe;
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
        
        setHasParticipated(true);
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
    <Card className={`group relative overflow-hidden bg-gradient-to-br ${theme.gradient} border-2 ${theme.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-32`}>
      {/* Decorative grid pattern - themed */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 15px, ${theme.bgPattern} 15px, ${theme.bgPattern} 16px),
                           repeating-linear-gradient(0deg, transparent, transparent 15px, ${theme.bgPattern} 15px, ${theme.bgPattern} 16px)`
        }}></div>
      </div>
      
      <CardContent className="relative p-3 h-full flex flex-col justify-between">
        {/* Header section */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-sm leading-tight truncate mb-1">
              {competition.title}
            </h3>
            
            {competition.theme && (
              <Badge className={`bg-gradient-to-r ${theme.gradient.replace('from-', 'from-').replace('via-', 'to-').split(' to-')[0]} to-${theme.decorativeElements.primary.replace('bg-', '')} text-white border-0 text-xs px-2 py-0.5 shadow-md`}>
                {categoryEmoji} {competition.theme}
              </Badge>
            )}
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1 bg-slate-50 rounded-md px-2 py-1">
            <Clock className={`w-3 h-3 ${getTimeColor(competition.end_date)}`} />
            <span className={`text-xs font-bold ${getTimeColor(competition.end_date)}`}>
              {timeRemaining}
            </span>
          </div>
        </div>

        {/* Button section */}
        <Button 
          onClick={handleStartGame}
          disabled={hasParticipated || isLoading}
          variant={getButtonVariant()}
          className={`w-full font-bold text-xs py-2 rounded-lg shadow-md transition-all duration-200 border-2 ${
            hasParticipated 
              ? 'bg-gray-400 hover:bg-gray-400 text-gray-600 border-gray-300 cursor-not-allowed' 
              : `bg-gradient-to-r ${theme.gradient.replace('from-', 'from-').replace('via-', 'to-').split(' to-')[0]} hover:opacity-90 text-white hover:shadow-lg border-${theme.decorativeElements.primary.replace('bg-', '')}/20`
          }`}
        >
          {getButtonText()}
        </Button>
      </CardContent>
      
      {/* Corner decoration - themed */}
      <div className={`absolute top-1 right-1 w-2 h-2 ${theme.decorativeElements.primary} rounded-full opacity-60`}></div>
      <div className={`absolute bottom-1 left-1 w-1.5 h-1.5 ${theme.decorativeElements.secondary} rounded-full opacity-60`}></div>
    </Card>
  );
};

export default CompetitionCard;
