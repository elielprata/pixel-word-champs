
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trophy, Edit, Trash2 } from 'lucide-react';

interface CompetitionActionsProps {
  competitionId: string;
  onViewRanking: (competitionId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const CompetitionActions: React.FC<CompetitionActionsProps> = ({
  competitionId,
  onViewRanking,
  onEdit,
  onDelete,
  isDeleting
}) => {
  return (
    <div className="flex gap-2 ml-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewRanking(competitionId)}
        className="h-8 w-8 p-0 hover:bg-green-50"
        title="Ver ranking"
      >
        <Trophy className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="h-8 w-8 p-0 hover:bg-blue-50"
        title="Editar competição"
      >
        <Edit className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        disabled={isDeleting}
        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
        title="Excluir competição"
      >
        {isDeleting ? (
          <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};
