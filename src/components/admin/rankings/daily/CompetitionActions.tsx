
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from 'lucide-react';

interface CompetitionActionsProps {
  competitionId: string;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const CompetitionActions: React.FC<CompetitionActionsProps> = ({
  competitionId,
  onEdit,
  onDelete,
  isDeleting
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('✏️ Clicando em Editar para competição:', competitionId);
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🗑️ Clicando em Excluir para competição:', competitionId);
    onDelete();
  };

  return (
    <div className="flex gap-2 ml-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
        className="h-8 w-8 p-0 hover:bg-blue-50"
        title="Editar competição"
        type="button"
      >
        <Edit className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
        title="Excluir competição"
        type="button"
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
