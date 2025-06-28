
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trophy } from 'lucide-react';
import { WeeklyConfig } from '@/types/weeklyConfig';
import { formatDateForDisplay } from '@/utils/dateFormatters';

interface FinalizationConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  activeConfig: WeeklyConfig | null;
  endedCompetitions: WeeklyConfig[];
}

export const FinalizationConfirmationDialog: React.FC<FinalizationConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  activeConfig,
  endedCompetitions
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const isConfirmationValid = confirmationText === 'FINALIZAR';
  const hasEndedCompetitions = endedCompetitions.length > 0;

  const handleConfirm = () => {
    if (isConfirmationValid) {
      onConfirm();
      setConfirmationText('');
    }
  };

  const handleCancel = () => {
    setConfirmationText('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Finalização de Competição
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta é uma operação crítica que não pode ser desfeita. Leia cuidadosamente antes de continuar.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Competições a serem finalizadas */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              {hasEndedCompetitions ? 'Competições Aguardando Finalização' : 'Competição Ativa'}
            </h4>
            
            {hasEndedCompetitions ? (
              <div className="space-y-2">
                {endedCompetitions.map(config => (
                  <div key={config.id} className="bg-white rounded p-2 border border-amber-200">
                    <p className="font-medium text-amber-800">
                      {formatDateForDisplay(config.start_date)} - {formatDateForDisplay(config.end_date)}
                    </p>
                    <p className="text-xs text-amber-600">Status: {config.status}</p>
                  </div>
                ))}
              </div>
            ) : activeConfig && (
              <div className="bg-white rounded p-2 border border-amber-200">
                <p className="font-medium text-amber-800">
                  {formatDateForDisplay(activeConfig.start_date)} - {formatDateForDisplay(activeConfig.end_date)}
                </p>
                <p className="text-xs text-amber-600">Status: {activeConfig.status}</p>
              </div>
            )}
          </div>

          {/* Consequências da finalização */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-3">⚠️ Esta operação irá:</h4>
            <ul className="text-sm text-red-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>Criar snapshot obrigatório</strong> com os resultados finais</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>Zerar pontuações de todos os usuários</strong> (total_score = 0)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>Marcar competição como finalizada</strong> permanentemente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>Ativar próxima competição agendada</strong> (se existir)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>Resetar melhores posições semanais</strong> de todos os usuários</span>
              </li>
            </ul>
          </div>

          {/* Campo de confirmação */}
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              Para confirmar, digite <span className="font-bold text-red-600">FINALIZAR</span> abaixo:
            </Label>
            <Input
              id="confirmation"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Digite FINALIZAR para confirmar"
              className="font-mono"
              disabled={isLoading}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full mr-2" />
                Finalizando...
              </>
            ) : (
              'Confirmar Finalização'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
