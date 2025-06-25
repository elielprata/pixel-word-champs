
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertTriangle, Info, Calendar, Clock } from 'lucide-react';
import { automationService } from '@/services/automationService';
import { useToast } from "@/hooks/use-toast";

interface DiagnosticResult {
  resetStatus: any;
  automationConfig: any;
  nextExecution: string;
  systemHealth: 'healthy' | 'warning' | 'error';
  issues: string[];
  lastCheck: string;
}

export const AutomationDiagnostics = () => {
  const { toast } = useToast();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      // Verificar status do reset
      const resetStatus = await automationService.checkResetStatus();
      
      // Carregar configurações atuais
      const automationConfig = await automationService.loadSettings();
      
      // Calcular próxima execução
      const nextExecution = resetStatus?.next_reset_date 
        ? `Próximo reset: ${new Date(resetStatus.next_reset_date).toLocaleDateString('pt-BR')} às 00:00:00`
        : 'Verificação diária às 00:00:00';

      // Analisar saúde do sistema
      const issues: string[] = [];
      let systemHealth: 'healthy' | 'warning' | 'error' = 'healthy';

      if (!automationConfig) {
        issues.push('Configuração de automação não encontrada');
        systemHealth = 'error';
      } else if (!automationConfig.enabled) {
        issues.push('Automação está desabilitada');
        systemHealth = 'warning';
      }

      if (automationConfig?.triggerType !== 'time_based') {
        issues.push('Tipo de trigger incorreto - deveria ser "time_based"');
        systemHealth = 'error';
      }

      if (resetStatus?.should_reset && automationConfig?.enabled) {
        issues.push('Reset pendente - sistema deveria executar reset agora');
        systemHealth = 'warning';
      }

      const result: DiagnosticResult = {
        resetStatus,
        automationConfig,
        nextExecution,
        systemHealth,
        issues,
        lastCheck: new Date().toLocaleString('pt-BR')
      };

      setDiagnostics(result);

      toast({
        title: "Diagnóstico concluído",
        description: `Sistema está ${systemHealth === 'healthy' ? 'saudável' : 'com problemas'}`,
        variant: systemHealth === 'error' ? 'destructive' : 'default'
      });

    } catch (error: any) {
      toast({
        title: "Erro no diagnóstico",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Saudável</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Atenção</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Diagnóstico do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Executando diagnóstico...' : 'Executar diagnóstico'}
        </Button>

        {diagnostics && (
          <div className="space-y-4">
            {/* Status Geral */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="font-medium">Status do Sistema</span>
              {getHealthBadge(diagnostics.systemHealth)}
            </div>

            {/* Configuração Atual */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Configuração Atual</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-600">Automação:</span>
                  <span className={`ml-2 font-medium ${diagnostics.automationConfig?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                    {diagnostics.automationConfig?.enabled ? 'Ativada' : 'Desativada'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Tipo:</span>
                  <span className="ml-2 font-medium">{diagnostics.automationConfig?.triggerType || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Status do Reset */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Status do Reset</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Período Atual:</span>
                </div>
                <div className="space-y-1 text-blue-700">
                  <div>Início: {diagnostics.resetStatus?.week_start ? new Date(diagnostics.resetStatus.week_start).toLocaleDateString('pt-BR') : 'N/A'}</div>
                  <div>Fim: {diagnostics.resetStatus?.week_end ? new Date(diagnostics.resetStatus.week_end).toLocaleDateString('pt-BR') : 'N/A'}</div>
                  <div>Deve resetar: {diagnostics.resetStatus?.should_reset ? 'Sim' : 'Não'}</div>
                </div>
              </div>
            </div>

            {/* Próxima Execução */}
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">{diagnostics.nextExecution}</span>
            </div>

            {/* Problemas Encontrados */}
            {diagnostics.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-red-600">Problemas Encontrados</h4>
                <div className="space-y-1">
                  {diagnostics.issues.map((issue, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                      <AlertTriangle className="h-3 w-3" />
                      {issue}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Última Verificação */}
            <div className="text-xs text-slate-500 text-center">
              Última verificação: {diagnostics.lastCheck}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
