
import React from 'react';
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  hasTitle: boolean;
  onCancel: () => void;
}

export const FormActions = ({ isSubmitting, hasTitle, onCancel }: FormActionsProps) => {
  return (
    <div className="flex gap-2 pt-4 border-t border-slate-200">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="flex-1 h-8"
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={!hasTitle || isSubmitting}
        className="flex-1 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
      >
        {isSubmitting ? 'Criando...' : 'Criar Competição'}
      </Button>
    </div>
  );
};
