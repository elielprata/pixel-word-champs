
import React from 'react';
import { Button } from "@/components/ui/button";

interface EditCompetitionActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isLoading: boolean;
}

export const EditCompetitionActions: React.FC<EditCompetitionActionsProps> = ({
  onCancel,
  onSave,
  isLoading
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        variant="outline" 
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancelar
      </Button>
      <Button 
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </div>
  );
};
