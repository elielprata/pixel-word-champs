
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from 'lucide-react';
import { useMonthlyInviteCompetition } from '@/hooks/useMonthlyInviteCompetition';
import LoadingState from './home/LoadingState';
import { CompetitionHeader } from './monthly-invite/CompetitionHeader';
import { UserStatsCards } from './monthly-invite/UserStatsCards';
import { UserPositionCard } from './monthly-invite/UserPositionCard';
import { ProgressCard } from './monthly-invite/ProgressCard';
import { CompetitionStatsCard } from './monthly-invite/CompetitionStatsCard';
import { TopPerformersCard } from './monthly-invite/TopPerformersCard';

const MonthlyInviteCompetition = () => {
  const { data, isLoading, error } = useMonthlyInviteCompetition();

  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingState />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4 text-center">
          <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-orange-700 font-medium">Competição Mensal Indisponível</p>
          <p className="text-sm text-orange-600 mt-1">
            {error || 'Não foi possível carregar os dados da competição'}
          </p>
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
