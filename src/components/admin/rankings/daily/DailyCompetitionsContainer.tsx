
import React from 'react';
import { Calendar } from 'lucide-react';
import { DailyCompetitionCard } from './DailyCompetitionCard';

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
  onDelete: (competition: DailyCompetition) => void;
  deletingId: string | null;
}

export const DailyCompetitionsContainer: React.FC<DailyCompetitionsContainerProps> = ({
  competitions,
  onRefresh,
  onDelete,
  deletingId
}) => {
  // Confiar completamente no status do banco de dados
  const displayCompetitions = competitions.filter(comp => 
    comp.status === 'active' || comp.status === 'scheduled' || comp.status === 'completed'
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Competições Diárias ({displayCompetitions.length})
        </h3>
      </div>
      
      <div className="grid gap-4">
        {displayCompetitions.map((competition) => (
          <DailyCompetitionCard
            key={competition.id}
            competition={competition}
            onDelete={onDelete}
            isDeleting={deletingId === competition.id}
          />
        ))}
      </div>
    </div>
  );
};
