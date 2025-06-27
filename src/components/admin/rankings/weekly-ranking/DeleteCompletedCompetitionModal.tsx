
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
import { useToast } from "@/hooks/use-toast";
import { formatDateForDisplay } from '@/utils/dateFormatters';
import { Trash2, AlertTriangle, Shield } from 'lucide-react';
import { WeeklyConfig } from '@/types/weeklyConfig';
import { useCompletedCompetitionOperations } from '@/hooks/useCompletedCompetitionOperations';

interface DeleteCompletedCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competition: WeeklyConfig | null;
  onSuccess: () => void;
}

export const DeleteCompletedCompetitionModal: React.FC<DeleteCompletedCompetitionModalProps> = ({
  open,
  onOpenChange,
  competition,
  onSuccess
}) => {
  const { toast } = useToast();
  const { deleteCompletedCompetition, isDeleting } = useCompletedCompetitionOperations();
  const [step, setStep] = useState<'warning' | 'confirmation'>('warning');
  const [confirmationText, setConfirmationText] = useState('');

  const handleClose = () => {
    setStep('warning');
    setConfirmationText('');
    onOpenChange(false);
  };

  const handleFirstConfirmation = () => {
    setStep('confirmation');
  };

  const handleFinalDelete = async () => {
    if (!competition || confirmationText !== 'EXCLUIR DEFINITIVAMENTE') {
      toast({
        title: "Confirmação Inválida",
        description: "Digite exatamente 'EXCLUIR DEFINITIVAMENTE' para confirmar",
        variant: "destructive",
      });
      return;
    }

    const result = await deleteCompletedCompetition(competition.id);

    if (result.success && result.data) {
      toast({
        title: "Competição Excluída!",
        description: `Competição e ${result.data.deleted_data?.ranking_records_deleted} registros relacionados foram excluídos permanentemente.`,
      });
      onSuccess();
      handleClose();
    } else {
      toast({
        title: "Erro",
        description: `Erro ao excluir competição: ${result.error}`,
        variant: "destructive",
      });
    }
  };

  if (!competition) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-lg">
        {step === 'warning' ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Atenção: Exclusão de Competição Finalizada
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Você está prestes a excluir permanentemente a competição finalizada do período de{' '}
                  <strong>{formatDateForDisplay(competition.start_date)}</strong> até{' '}
                  <strong>{formatDateForDisplay(competition.end_date)}</strong>.
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="font-semibold text-red-800 mb-2">⚠️ DADOS QUE SERÃO PERDIDOS:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Rankings e posições dos participantes</li>
                    <li>• Histórico de premiações</li>
                    <li>• Snapshots da competição</li>
                    <li>• Dados estatísticos</li>
                    <li>• Logs de auditoria relacionados</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">🛡️ PROTEÇÕES ATIVAS:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Apenas competições finalizadas há mais de 7 dias podem ser excluídas</li>
                    <li>• Ação registrada em logs de auditoria</li>
                    <li>• Processo de dupla confirmação obrigatório</li>
                  </ul>
                </div>

                <p className="text-sm font-medium text-gray-600">
                  Esta ação é <strong>IRREVERSÍVEL</strong>. Todos os dados serão perdidos permanentemente.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleFirstConfirmation}
                disabled={isDeleting}
                className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
              >
                <Shield className="h-4 w-4 mr-2" />
                Continuar para Confirmação
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Confirmação Final de Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold mb-2">
                    🚨 ÚLTIMA CHANCE PARA CANCELAR
                  </p>
                  <p className="text-red-700 text-sm">
                    Esta é sua última oportunidade para cancelar. Uma vez confirmado, 
                    todos os dados da competição serão excluídos permanentemente.
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmation" className="text-sm font-medium">
                    Para confirmar, digite exatamente: <code className="bg-gray-100 px-1 rounded">EXCLUIR DEFINITIVAMENTE</code>
                  </Label>
                  <Input
                    id="confirmation"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Digite aqui..."
                    className="mt-2"
                    disabled={isDeleting}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setStep('warning')} disabled={isDeleting}>
                Voltar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleFinalDelete}
                disabled={isDeleting || confirmationText !== 'EXCLUIR DEFINITIVAMENTE'}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full mr-2" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>Excluir Definitivamente</span>
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
