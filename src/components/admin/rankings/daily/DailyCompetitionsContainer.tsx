
import React from 'react';
import { Calendar } from 'lucide-react';
import { DailyCompetitionCard } from './DailyCompetitionCard';
import { useDailyCompetitionsLogic } from '@/hooks/useDailyCompetitionsLogic';
import { useDailyCompetitionsActions } from '@/hooks/useDailyCompetitionsActions';

interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
  theme: string;
  rules: any;
}

interface DailyCompetitionsContainerProps {
  competitions: DailyCompetition[];
  onRefresh?: () => void;
}

export const DailyCompetitionsContainer: React.FC<DailyCompetitionsContainerProps> = ({
  competitions,
  onRefresh
}) => {
  const { activeCompetitions } = useDailyCompetitionsLogic(competitions);
  const { deletingId, handleEdit, handleDelete } = useDailyCompetitionsActions();

  const onEditCompetition = (competition: DailyCompetition) => {
    console.log('📋 Container: onEditCompetition chamado para:', competition.id);
    handleEdit(competition);
  };

  const onDeleteCompetition = (competition: DailyCompetition) => {
    handleDelete(competition, onRefresh);
  };

  console.log('🏢 Container: activeCompetitions:', activeCompetitions.length);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Competições Diárias Ativas ({activeCompetitions.length})
        </h3>
      </div>
      
      <div className="grid gap-4">
        {activeCompetitions.map((competition) => (
          <DailyCompetitionCard
            key={competition.id}
            competition={competition}
            onEdit={onEditCompetition}
            onDelete={onDeleteCompetition}
            isDeleting={deletingId === competition.id}
          />
        ))}
      </div>
    </div>
  );
};
