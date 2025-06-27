
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, Clock } from 'lucide-react';
import { WeeklyConfig } from '@/types/weeklyConfig';
import { formatDateForDisplay } from '@/utils/dateFormatters';

interface ActiveCompetitionErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCompetition: WeeklyConfig | null;
}

export const ActiveCompetitionErrorModal: React.FC<ActiveCompetitionErrorModalProps> = ({
  open,
  onOpenChange,
  activeCompetition
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Competição Ativa Encontrada
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 mb-3">
              Não é possível criar uma nova competição porque já existe uma competição ativa no sistema.
            </p>
            
            {activeCompetition && (
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <h4 className="font-medium text-amber-900 mb-2">Competição Ativa Atual:</h4>
                <div className="space-y-2 text-sm text-amber-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDateForDisplay(activeCompetition.start_date)} - {formatDateForDisplay(activeCompetition.end_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Status: {activeCompetition.status}</span>
                  </div>
                  {activeCompetition.activated_at && (
                    <div className="text-xs text-amber-600">
                      Ativada em: {new Date(activeCompetition.activated_at).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Para criar uma nova competição:</strong> Primeiro finalize a competição atual usando a aba "Finalizar Atual" ou aguarde até que ela termine automaticamente.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
