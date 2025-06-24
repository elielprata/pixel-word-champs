
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, RotateCcw, Shield } from 'lucide-react';
import { useWeeklyRankingReset } from '@/hooks/useWeeklyRankingReset';
import { logger } from '@/utils/logger';

export const WeeklyRankingResetPanel = () => {
  const [adminPassword, setAdminPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const resetMutation = useWeeklyRankingReset();

  const handleReset = () => {
    if (!adminPassword.trim()) {
      return;
    }

    logger.info('Iniciando reset do ranking semanal', undefined, 'WEEKLY_RANKING_RESET_PANEL');
    resetMutation.mutate();
    setAdminPassword('');
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setAdminPassword('');
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-orange-600" />
          Reset de Pontuações Semanais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">⚠️ AÇÃO IRREVERSÍVEL</p>
              <p>Esta ação irá:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Resetar todas as pontuações para 0</li>
                <li>Limpar todas as posições semanais</li>
                <li>Limpar o ranking da semana atual</li>
                <li>Registrar a ação nos logs de automação</li>
              </ul>
            </div>
          </div>
        </div>

        {!showConfirm ? (
          <Button 
            onClick={() => setShowConfirm(true)}
            variant="destructive"
            className="w-full"
            disabled={resetMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar Pontuações Semanais
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Senha de Administrador
              </Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Digite sua senha de administrador"
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                variant="destructive"
                disabled={!adminPassword.trim() || resetMutation.isPending}
                className="flex-1"
              >
                {resetMutation.isPending ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Resetando...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Confirmar Reset
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={resetMutation.isPending}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
