
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WeeklyRankingControlsProps {
  onResetScores: () => Promise<void>;
}

export const WeeklyRankingControls: React.FC<WeeklyRankingControlsProps> = ({
  onResetScores
}) => {
  const [isResetting, setIsResetting] = useState(false);

  const handleResetScores = async () => {
    setIsResetting(true);
    try {
      await onResetScores();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Controles do Ranking Semanal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/70 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <RefreshCw className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Sistema Automático</h4>
              <p className="text-sm text-gray-600">
                O ranking é atualizado automaticamente e zerado toda segunda-feira às 00:00.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <RotateCcw className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Reset Manual</h4>
              <p className="text-sm text-gray-600 mb-3">
                Use apenas em situações especiais. Esta ação zeará todas as pontuações imediatamente.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    disabled={isResetting}
                  >
                    {isResetting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Resetando...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Manual
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Confirmar Reset Manual
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Zerar todas as pontuações dos usuários</li>
                        <li>Resetar as melhores posições semanais</li>
                        <li>Iniciar uma nova semana de ranking</li>
                      </ul>
                      <br />
                      <strong>Esta ação não pode ser desfeita.</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleResetScores}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Confirmar Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
