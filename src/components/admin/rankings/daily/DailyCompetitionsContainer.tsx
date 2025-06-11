
import React from 'react';
import { Calendar } from 'lucide-react';
import { DailyCompetitionCard } from './DailyCompetitionCard';
import { useDailyCompetitionsLogic } from '@/hooks/useDailyCompetitionsLogic';

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
  onEdit: (competition: DailyCompetition) => void;
  onDelete: (competition: DailyCompetition) => void;
  deletingId: string | null;
}

export const DailyCompetitionsContainer: React.FC<DailyCompetitionsContainerProps> = ({
  competitions,
  onRefresh,
  onEdit,
  onDelete,
  deletingId
}) => {
  const { activeCompetitions } = useDailyCompetitionsLogic(competitions);

  console.log('🏢 Container: Recebendo props para ações:', {
    activeCompetitions: activeCompetitions.length,
    hasOnEdit: !!onEdit,
    hasOnDelete: !!onDelete,
    deletingId
  });

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
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={deletingId === competition.id}
          />
        ))}
      </div>
    </div>
  );
};
