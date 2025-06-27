
import React from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, AlertTriangle } from 'lucide-react';

interface EditCompetitionModalHeaderProps {
  isActive: boolean;
}

export const EditCompetitionModalHeader: React.FC<EditCompetitionModalHeaderProps> = ({
  isActive
}) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Editar Competição {isActive ? 'Ativa' : 'Agendada'}
        </DialogTitle>
      </DialogHeader>
      
      {isActive && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium text-sm">Competição Ativa</span>
          </div>
          <p className="text-amber-700 text-xs">
            Para competições ativas, apenas a data de fim pode ser alterada.
          </p>
        </div>
      )}
    </>
  );
};
