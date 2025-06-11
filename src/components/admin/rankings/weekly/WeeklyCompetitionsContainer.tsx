
import React from 'react';
import { Calendar } from 'lucide-react';
import { WeeklyCompetitionCard } from './WeeklyCompetitionCard';
import { useWeeklyCompetitionsLogic } from '@/hooks/useWeeklyCompetitionsLogic';

interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
}

interface WeeklyCompetitionsContainerProps {
  competitions: WeeklyCompetition[];
  onRefresh?: () => void;
  onViewRanking: (competition: WeeklyCompetition) => void;
  onEdit: (competition: WeeklyCompetition) => void;
  onDelete: (competition: WeeklyCompetition) => void;
  deletingId: string | null;
}

export const WeeklyCompetitionsContainer: React.FC<WeeklyCompetitionsContainerProps> = ({
  competitions,
  onRefresh,
  onViewRanking,
  onEdit,
  onDelete,
  deletingId
}) => {
  const { activeCompetitions } = useWeeklyCompetitionsLogic(competitions);

  console.log('🏢 WeeklyContainer: Recebendo props para ações:', {
    activeCompetitions: activeCompetitions.length,
    hasOnEdit: !!onEdit,
    hasOnDelete: !!onDelete,
    hasOnViewRanking: !!onViewRanking,
    deletingId
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Competições Semanais Ativas ({activeCompetitions.length})
        </h3>
      </div>
      
      <div className="grid gap-4">
        {activeCompetitions.map((competition) => (
          <WeeklyCompetitionCard
            key={competition.id}
            competition={competition}
            onViewRanking={onViewRanking}
            onEdit={onEdit}
            onDelete={onDelete}
            deletingId={deletingId}
          />
        ))}
      </div>
    </div>
  );
};
