
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trophy, Edit, Trash2 } from 'lucide-react';

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

interface WeeklyCompetitionActionsProps {
  competition: WeeklyCompetition;
  onViewRanking: (competition: WeeklyCompetition) => void;
  onEdit: (competition: WeeklyCompetition) => void;
  onDelete: (competition: WeeklyCompetition) => void;
  deletingId: string | null;
  size?: 'sm' | 'default';
  className?: string;
}

export const WeeklyCompetitionActions = ({
  competition,
  onViewRanking,
  onEdit,
  onDelete,
  deletingId,
  size = 'sm',
  className = ''
}: WeeklyCompetitionActionsProps) => {
  const buttonSize = size === 'sm' ? 'h-8 w-8 p-0' : 'h-7 w-7 p-0';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3 w-3';

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewRanking(competition)}
        className={`${buttonSize} hover:bg-green-50`}
        title="Ver ranking"
      >
        <Trophy className={iconSize} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(competition)}
        className={`${buttonSize} hover:bg-blue-50`}
        title="Editar competição"
      >
        <Edit className={iconSize} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(competition)}
        disabled={deletingId === competition.id}
        className={`${buttonSize} hover:bg-red-50 hover:text-red-600`}
        title="Excluir competição"
      >
        {deletingId === competition.id ? (
          <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
        ) : (
          <Trash2 className={iconSize} />
        )}
      </Button>
    </div>
  );
};
