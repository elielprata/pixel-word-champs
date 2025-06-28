
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Trophy, Users } from 'lucide-react';
import { useMonthlyInviteCompetition } from '@/hooks/useMonthlyInviteCompetition';
import LoadingState from './home/LoadingState';
import { CompetitionHeader } from './monthly-invite/CompetitionHeader';
import { UserStatsCards } from './monthly-invite/UserStatsCards';
import { UserPositionCard } from './monthly-invite/UserPositionCard';
import { ProgressCard } from './monthly-invite/ProgressCard';
import { CompetitionStatsCard } from './monthly-invite/CompetitionStatsCard';
import { TopPerformersCard } from './monthly-invite/TopPerformersCard';

interface MonthlyInviteCompetitionProps {
  suppressLoading?: boolean;
}

const MonthlyInviteCompetition = ({ suppressLoading = false }: MonthlyInviteCompetitionProps) => {
  const { data, isLoading, error } = useMonthlyInviteCompetition();

  if (isLoading && !suppressLoading) {
    return (
      <div className="p-4">
        <LoadingState />
      </div>
    );
  }

  if (error || !data) {
    const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <Trophy className="w-8 h-8 text-blue-500 mr-2" />
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-blue-800 font-medium mb-2">Competição de Indicações de {currentMonth}</p>
          <p className="text-sm text-blue-700 mb-2">
            Participe automaticamente indicando seus amigos!
          </p>
          <div className="flex items-center justify-center text-xs text-blue-600 mt-3">
            <Users className="w-4 h-4 mr-1" />
            <span>Competição mensal • Sem necessidade de cadastro adicional</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { userPoints, userPosition, stats } = data;
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  
  // Calculate days remaining in month
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate progress to next milestone
  const nextMilestone = Math.ceil(userPoints.invite_points / 250) * 250;
  const milestoneProgress = nextMilestone > 0 ? (userPoints.invite_points / nextMilestone) * 100 : 0;

  return (
    <div className="space-y-4">
      <CompetitionHeader 
        currentMonth={currentMonth}
        daysRemaining={daysRemaining}
      />

      <UserStatsCards 
        userPoints={userPoints}
        userPosition={userPosition}
      />

      {userPosition && (
        <UserPositionCard userPosition={userPosition} />
      )}

      <ProgressCard 
        userPoints={userPoints}
        nextMilestone={nextMilestone}
        milestoneProgress={milestoneProgress}
      />

      <CompetitionStatsCard stats={stats} />

      <TopPerformersCard topPerformers={stats.topPerformers} />
    </div>
  );
};

export default MonthlyInviteCompetition;
