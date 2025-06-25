
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RotateCcw, Zap, ArrowRight, X } from 'lucide-react';
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
  const [isPrepared, setIsPrepared] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handlePrepareReset = () => {
    setIsPrepared(true);
  };

  const handleCancelPreparation = () => {
    setIsPrepared(false);
  };

  const handleExecuteReset = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmReset = async (password: string) => {
    try {
      await onEmergencyReset(password);
      setShowConfirmModal(false);
      setIsPrepared(false);
    } catch (error) {
      // Erro já é tratado no hook
      throw error;
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
  };

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

      {!isPrepared ? (
        // Estado inicial - apenas botão de preparar
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handlePrepareReset}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
            disabled={isResettingScores}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Preparar Reset de Emergência
          </Button>
        </div>
      ) : (
        // Estado preparado - área de confirmação
        <div className="space-y-4">
          <Alert variant="destructive" className="border-red-300 bg-red-50">
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>SISTEMA PREPARADO PARA RESET!</strong><br />
              Clique em "Executar Reset" para prosseguir com a operação de emergência.
              Você precisará confirmar sua senha de administrador.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4">
            <Button
              variant="destructive"
              onClick={handleExecuteReset}
              disabled={isResettingScores}
              className="bg-red-600 hover:bg-red-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Executar Reset de Emergência
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              onClick={handleCancelPreparation}
              disabled={isResettingScores}
              className="text-slate-600 hover:text-slate-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <ResetScoresModal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmReset}
        isResetting={isResettingScores}
      />
    </div>
  );
};
