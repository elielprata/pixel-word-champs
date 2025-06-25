
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { DebugPanelHeader } from '@/components/admin/debug/DebugPanelHeader';
import { DebugActionButtons } from '@/components/admin/debug/DebugActionButtons';
import { RankingResultDisplay } from '@/components/admin/debug/RankingResultDisplay';
import { ProtectionResultDisplay } from '@/components/admin/debug/ProtectionResultDisplay';
import { WeeklyPeriodTestPanel } from '@/components/admin/debug/WeeklyPeriodTestPanel';
import { useDebugActions } from '@/components/admin/debug/useDebugActions';

const RankingDebugPanel = () => {
  const {
    isChecking,
    isUpdating,
    isTesting,
    isValidatingProtection,
    lastResult,
    protectionResult,
    error,
    handleCheckConsistency,
    handleForceUpdate,
    handleTestFunction,
    handleValidateProtection
  } = useDebugActions();

  return (
    <div className="space-y-4">
      {/* Novo Painel de Teste de Período Semanal */}
      <WeeklyPeriodTestPanel />
      
      {/* Painel de Debug Existente */}
      <Card className="border-yellow-200 bg-yellow-50">
        <DebugPanelHeader />
        
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
              <strong>Erro:</strong> {error}
            </div>
          )}
          
          <RankingResultDisplay lastResult={lastResult} />
          <ProtectionResultDisplay protectionResult={protectionResult} />
          
          <DebugActionButtons
            isChecking={isChecking}
            isUpdating={isUpdating}
            isTesting={isTesting}
            isValidatingProtection={isValidatingProtection}
            onCheckConsistency={handleCheckConsistency}
            onForceUpdate={handleForceUpdate}
            onTestFunction={handleTestFunction}
            onValidateProtection={handleValidateProtection}
          />
          
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              ✅ <strong>Período Semanal Corrigido:</strong> As funções de cálculo foram atualizadas para garantir domingo a sábado.
            </p>
          </div>
          
          <p className="text-xs text-yellow-600">
            ⚠️ Use o novo painel de teste acima para verificar se o cálculo de período está funcionando corretamente
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingDebugPanel;
