
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Users, Trophy } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResetScoresModal } from '../users/ResetScoresModal';
import { useAllUsers } from '@/hooks/useAllUsers';
import { useWeeklyRankingReset } from '@/hooks/useWeeklyRankingReset';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export const AdministrativeControlsCard = () => {
  const [showGeneralResetModal, setShowGeneralResetModal] = useState(false);
  const [showWeeklyResetModal, setShowWeeklyResetModal] = useState(false);
  const { toast } = useToast();
  
  const { resetAllScores, isResettingScores } = useAllUsers();
  const weeklyResetMutation = useWeeklyRankingReset();

  const handleGeneralReset = async (password: string) => {
    logger.info('Iniciando reset geral de pontuações', undefined, 'ADMIN_CONTROLS');
    await resetAllScores(password);
  };

  const handleWeeklyReset = async (password: string) => {
    logger.info('Iniciando reset de ranking semanal', undefined, 'ADMIN_CONTROLS');
    
    try {
      // Validar senha (usando a mesma lógica do reset geral)
      if (password !== 'admin123') {
        throw new Error('Senha de administrador incorreta');
      }
      
      await weeklyResetMutation.mutateAsync();
      setShowWeeklyResetModal(false);
      
      toast({
        title: "Sucesso",
        description: "Ranking semanal resetado com sucesso!",
      });
    } catch (error: any) {
      logger.error('Erro no reset semanal', { error: error.message }, 'ADMIN_CONTROLS');
      throw error; // Re-throw para o modal tratar
    }
  };

  return (
    <>
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-red-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Controles Administrativos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              <strong>Atenção:</strong> Essas operações são irreversíveis e afetam todos os usuários do sistema.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Reset Geral */}
            <div className="space-y-2">
              <Button
                onClick={() => setShowGeneralResetModal(true)}
                variant="destructive"
                className="w-full flex items-center gap-2"
                disabled={isResettingScores || weeklyResetMutation.isPending}
              >
                <Users className="h-4 w-4" />
                Zerar Pontuação Geral
              </Button>
              <p className="text-xs text-gray-600 text-center">
                Remove todas as pontuações e estatísticas de todos os usuários
              </p>
            </div>

            {/* Reset Semanal */}
            <div className="space-y-2">
              <Button
                onClick={() => setShowWeeklyResetModal(true)}
                variant="destructive"
                className="w-full flex items-center gap-2"
                disabled={isResettingScores || weeklyResetMutation.isPending}
              >
                <Trophy className="h-4 w-4" />
                Resetar Ranking Semanal
              </Button>
              <p className="text-xs text-gray-600 text-center">
                Reinicia apenas o ranking semanal atual
              </p>
            </div>
          </div>

          <div className="bg-yellow-100 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Uso Recomendado:</strong> Use apenas em casos de emergência ou manutenção programada. 
              O sistema possui reset automático na finalização de competições.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <ResetScoresModal
        isOpen={showGeneralResetModal}
        onClose={() => setShowGeneralResetModal(false)}
        onConfirm={handleGeneralReset}
        isResetting={isResettingScores}
      />

      <ResetScoresModal
        isOpen={showWeeklyResetModal}
        onClose={() => setShowWeeklyResetModal(false)}
        onConfirm={handleWeeklyReset}
        isResetting={weeklyResetMutation.isPending}
      />
    </>
  );
};
