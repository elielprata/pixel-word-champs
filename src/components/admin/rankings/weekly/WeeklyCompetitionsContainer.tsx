
import React from 'react';
import { Trophy } from 'lucide-react';
import { ActiveCompetitionCard } from './ActiveCompetitionCard';
import { WeeklyCompetitionCard } from './WeeklyCompetitionCard';
import { useWeeklyCompetitionsLogic } from '@/hooks/useWeeklyCompetitionsLogic';
import { useWeeklyCompetitionsActions } from '@/hooks/useWeeklyCompetitionsActions';

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
}

export const WeeklyCompetitionsContainer: React.FC<WeeklyCompetitionsContainerProps> = ({
  competitions,
  onRefresh
}) => {
  const {
    currentActiveCompetition,
    otherActiveCompetitions,
    deletingId,
    handleDelete
  } = useWeeklyCompetitionsLogic(competitions);

  const {
    handleViewRanking,
    handleEdit
  } = useWeeklyCompetitionsActions();

  const onDeleteCompetition = (competition: WeeklyCompetition) => {
    handleDelete(competition, onRefresh);
  };

  return (
    <>
      {currentActiveCompetition && (
        <ActiveCompetitionCard
          competition={currentActiveCompetition}
          onViewRanking={handleViewRanking}
          onEdit={handleEdit}
          onDelete={onDeleteCompetition}
          deletingId={deletingId}
        />
      )}

      {otherActiveCompetitions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            {currentActiveCompetition ? 'Outras Competições Semanais' : 'Competições Semanais Aguardando Início'}
          </h3>
          
          <div className="grid gap-4">
            {otherActiveCompetitions.map((competition) => (
              <WeeklyCompetitionCard
                key={competition.id}
                competition={competition}
                onViewRanking={handleViewRanking}
                onEdit={handleEdit}
                onDelete={onDeleteCompetition}
                deletingId={deletingId}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};
