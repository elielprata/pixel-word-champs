
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RotateCcw, Zap } from 'lucide-react';
import { ResetScoresModal } from '../../users/ResetScoresModal';

interface EmergencyResetSectionProps {
  showEmergencyReset: boolean;
  isResettingScores: boolean;
  onToggleEmergencyReset: () => void;
  onEmergencyReset: (password: string) => Promise<void>;
}

export const EmergencyResetSection: React.FC<EmergencyResetSectionProps> = ({
  showEmergencyReset,
  isResettingScores,
  onToggleEmergencyReset,
  onEmergencyReset
}) => {
  return (
    <div className="space-y-4">
      <p className="text-slate-700">
        Use esta funcionalidade para zerar manualmente todas as pontuações dos usuários em situações de emergência.
      </p>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>ATENÇÃO:</strong> Esta ação é irreversível e zerará imediatamente a pontuação de todos os usuários do sistema.
          Use apenas em casos de emergência ou manutenção programada.
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onToggleEmergencyReset}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {showEmergencyReset ? 'Cancelar' : 'Preparar Reset de Emergência'}
        </Button>
      </div>

      <ResetScoresModal
        isOpen={showEmergencyReset}
        onClose={onToggleEmergencyReset}
        onConfirm={onEmergencyReset}
        isResetting={isResettingScores}
      />
    </div>
  );
};
