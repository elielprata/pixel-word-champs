
import React from 'react';
import { Calendar, Trophy } from 'lucide-react';
import { WeeklyCompetitionCard } from './WeeklyCompetitionCard';
import { useWeeklyCompetitionsLogic } from '@/hooks/admin/useWeeklyCompetitionsLogic';

interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants?: number;
}

interface WeeklyCompetitionsContainerProps {
  competitions: WeeklyCompetition[];
  onViewRanking: (competition: WeeklyCompetition) => void;
  onEdit: (competition: WeeklyCompetition) => void;
  onRefresh?: () => void;
}

export const WeeklyCompetitionsContainer: React.FC<WeeklyCompetitionsContainerProps> = ({
  competitions,
  onViewRanking,
  onEdit,
  onRefresh
}) => {
  const { activeCompetitions, currentActiveCompetition, otherActiveCompetitions } = useWeeklyCompetitionsLogic(competitions);

  // Mock delete handler and deletingId for compatibility
  const handleDelete = (competition: WeeklyCompetition) => {
    console.log('Delete not implemented:', competition.id);
  };

  return (
    <div>
      {currentActiveCompetition && (
        <div className="mb-6 p-4 rounded-md bg-gradient-to-r from-green-100 to-blue-100 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Competição Ativa
            </h3>
          </div>
          <WeeklyCompetitionCard
            competition={currentActiveCompetition}
            onViewRanking={onViewRanking}
            onEdit={onEdit}
            onDelete={handleDelete}
            deletingId={null}
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Outras Competições ({otherActiveCompetitions.length})
        </h3>
      </div>
      
      <div className="grid gap-4">
        {otherActiveCompetitions.map((competition) => (
          <WeeklyCompetitionCard
            key={competition.id}
            competition={competition}
            onViewRanking={onViewRanking}
            onEdit={onEdit}
            onDelete={handleDelete}
            deletingId={null}
          />
        ))}
      </div>
    </div>
  );
};
