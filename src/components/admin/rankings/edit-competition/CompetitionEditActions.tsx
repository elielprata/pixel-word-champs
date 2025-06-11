
import React from 'react';
import { Button } from "@/components/ui/button";

interface CompetitionEditActionsProps {
  isLoading: boolean;
  onCancel: () => void;
}

export const CompetitionEditActions = ({ isLoading, onCancel }: CompetitionEditActionsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </div>
  );
};
