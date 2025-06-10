
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { gameService } from '@/services/gameService';
import { competitionParticipationService } from '@/services/competitionParticipationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { utcToBrasilia, brasiliaToUtc, formatBrasiliaTime } from '@/utils/brasiliaTime';
import { getCompetitionTheme, getCategoryEmoji, getCategoryDescription, getCategoryTexture } from '@/utils/competitionThemes';

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
  const [timeProgress, setTimeProgress] = useState(100);

  // Obter tema baseado na categoria/theme da competição
  const theme = getCompetitionTheme(competition.theme);
  const categoryEmoji = getCategoryEmoji(competition.theme);
  const categoryDescription = getCategoryDescription(competition.theme);
  const categoryTexture = getCategoryTexture(competition.theme);

  useEffect(() => {
    checkParticipation();
  }, [user, competition.id]);

  useEffect(() => {
    const updateTimer = () => {
      const { remaining, progress } = formatTimeRemaining(competition.end_date);
      setTimeRemaining(remaining);
      setTimeProgress(progress);
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
    
    // Calcular progresso (assumindo 24h total)
    const totalTime = 24 * 60 * 60 * 1000; // 24 horas em ms
    const progress = Math.max(0, Math.min(100, (diff / totalTime) * 100));
    
    if (diff <= 0) return { remaining: 'Finalizada', progress: 0 };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return { remaining: `${hours}h ${minutes}m`, progress };
    }
    if (minutes > 0) {
      return { remaining: `${minutes}m ${seconds}s`, progress };
    }
    return { remaining: `${seconds}s`, progress };
  };

  const getUrgencyColor = (progress: number) => {
    if (progress <= 10) return 'text-red-600 bg-red-100';
    if (progress <= 30) return 'text-orange-600 bg-orange-100';
    return 'text-emerald-600 bg-emerald-100';
  };

  const getProgressColor = (progress: number) => {
    if (progress <= 10) return 'bg-red-500';
    if (progress <= 30) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  const getCardGradient = (progress: number) => {
    if (progress <= 10) return 'from-red-50 via-red-25 to-white';
    if (progress <= 30) return 'from-orange-50 via-orange-25 to-white';
    return theme.gradient;
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
    <Card className={`group relative overflow-hidden bg-gradient-to-br ${getCardGradient(timeProgress)} border-2 ${theme.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-36`}>
      {/* Textura temática de fundo */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full bg-repeat"
          style={{
            backgroundImage: categoryTexture,
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      {/* Padrão decorativo adicional */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${theme.bgPattern} 10px, ${theme.bgPattern} 11px)`
        }}></div>
      </div>
      
      <CardContent className="relative p-3 h-full flex flex-col justify-between">
        {/* Header section */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-sm leading-tight truncate mb-1">
              {competition.title}
            </h3>
            
            {/* Categoria com mini-preview visual */}
            {competition.theme && (
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`bg-gradient-to-r ${theme.gradient.replace('from-', 'from-').replace('via-', 'to-').split(' to-')[0]} to-${theme.decorativeElements.primary.replace('bg-', '')} text-white border-0 text-xs px-2 py-0.5 shadow-md flex items-center gap-1`}>
                  <span className="text-xs">{categoryEmoji}</span>
                  <span className="font-medium">{competition.theme}</span>
                </Badge>
              </div>
            )}

            {/* Descrição temática */}
            <p className="text-xs text-slate-600 italic leading-tight">
              {categoryDescription}
            </p>
          </div>

          {/* Timer com círculo progressivo */}
          <div className="flex flex-col items-center gap-1">
            <div className={`relative w-12 h-12 rounded-full ${getUrgencyColor(timeProgress)} flex items-center justify-center shadow-sm`}>
              {/* Círculo de progresso */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  className={timeProgress <= 10 ? 'text-red-500' : timeProgress <= 30 ? 'text-orange-500' : 'text-emerald-500'}
                  strokeDasharray={`${timeProgress}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <Clock className="w-4 h-4 relative z-10" />
            </div>
            <span className={`text-xs font-bold ${timeProgress <= 10 ? 'text-red-600' : timeProgress <= 30 ? 'text-orange-600' : 'text-emerald-600'}`}>
              {timeRemaining}
            </span>
          </div>
        </div>

        {/* Barra de progresso de tempo */}
        <div className="mb-2">
          <Progress 
            value={timeProgress} 
            className="h-1 bg-gray-200"
            style={{
              background: 'rgb(229 231 235)'
            }}
          />
          <style jsx>{`
            .progress-indicator {
              background: ${timeProgress <= 10 ? '#ef4444' : timeProgress <= 30 ? '#f97316' : '#10b981'};
            }
          `}</style>
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
      
      {/* Corner decorations - themed */}
      <div className={`absolute top-1 right-1 w-2 h-2 ${theme.decorativeElements.primary} rounded-full opacity-60`}></div>
      <div className={`absolute bottom-1 left-1 w-1.5 h-1.5 ${theme.decorativeElements.secondary} rounded-full opacity-60`}></div>
    </Card>
  );
};

export default CompetitionCard;
