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
  total_participants?: number; // Made optional to match other components
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

  const handleViewRanking = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🏆 Clicando em Ver Ranking para competição:', competition.id);
    onViewRanking(competition);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('✏️ Clicando em Editar para competição:', competition.id);
    onEdit(competition);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🗑️ Clicando em Excluir para competição:', competition.id);
    onDelete(competition);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewRanking}
        className={`${buttonSize} hover:bg-green-50`}
        title="Ver ranking"
        type="button"
      >
        <Trophy className={iconSize} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
        className={`${buttonSize} hover:bg-blue-50`}
        title="Editar competição"
        type="button"
      >
        <Edit className={iconSize} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={deletingId === competition.id}
        className={`${buttonSize} hover:bg-red-50 hover:text-red-600`}
        title="Excluir competição"
        type="button"
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
