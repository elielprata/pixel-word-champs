import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { useRankingData } from '@/hooks/useRankingData';

const GlobalRankingCard = () => {
  const { isAuthenticated } = useAuth();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { weeklyRanking, isLoading: rankingLoading } = useRankingData();

  const isLoading = statsLoading || rankingLoading;

  // Não renderizar se não estiver autenticado
  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular pontos necessários para próxima posição
  const currentPosition = stats.position || weeklyRanking.length + 1;
  const currentScore = stats.totalScore;
  
  let nextPositionScore = 0;
  let pointsNeeded = 0;
  
  if (currentPosition > 1 && weeklyRanking.length > 0) {
    const nextRankPlayer = weeklyRanking.find(player => player.pos === currentPosition - 1);
    if (nextRankPlayer) {
      nextPositionScore = nextRankPlayer.score;
      pointsNeeded = Math.max(0, nextPositionScore - currentScore + 1);
    }
  }

  const progress = pointsNeeded > 0 ? Math.min(95, (currentScore / nextPositionScore) * 100) : 100;

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-card-foreground">Ranking Global</CardTitle>
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
            <div className="text-primary-foreground font-bold text-sm">
              #{currentPosition}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Posição atual</div>
            <div className="text-lg font-bold text-card-foreground mb-2">
              {currentPosition}º lugar mundial
            </div>
            {pointsNeeded > 0 && (
              <>
                <Progress value={progress} className="h-1.5 mb-1" />
                <div className="text-xs text-muted-foreground">
                  {pointsNeeded.toLocaleString()} pts para o {currentPosition - 1}º lugar
                </div>
              </>
            )}
            {pointsNeeded === 0 && currentPosition === 1 && (
              <div className="text-xs text-green-600 font-medium">
                🏆 Você está em 1º lugar!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalRankingCard;