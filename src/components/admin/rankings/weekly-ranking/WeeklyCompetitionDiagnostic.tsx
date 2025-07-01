
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, RefreshCw, Zap, Settings } from 'lucide-react';
import { useWeeklyCompetitionDiagnostic } from '@/hooks/useWeeklyCompetitionDiagnostic';
import { useToast } from '@/hooks/use-toast';

export const WeeklyCompetitionDiagnostic = () => {
  const { 
    diagnostic, 
    isChecking, 
    isActivating, 
    runDiagnostic, 
    forceActivation 
  } = useWeeklyCompetitionDiagnostic();
  const { toast } = useToast();

  useEffect(() => {
    runDiagnostic();
  }, []);

  const handleForceActivation = async () => {
    const result = await forceActivation();
    
    if (result.success) {
      toast({
        title: "Ativação bem-sucedida",
        description: `${result.data?.updated_count || 0} competições foram atualizadas.`,
      });
    } else {
      toast({
        title: "Erro na ativação",
        description: result.error || "Falha ao ativar competições",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    if (!diagnostic) return null;
    
    const { systemStatus } = diagnostic;
    if (systemStatus === 'healthy') {
      return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Saudável</Badge>;
    }
    return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Atenção</Badge>;
  };

  if (!diagnostic && isChecking) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">Verificando sistema...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const needsActivation = diagnostic?.hasScheduledCompetitions && !diagnostic?.hasActiveCompetition;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <CardTitle className="text-base">Diagnóstico do Sistema</CardTitle>
            {getStatusBadge()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runDiagnostic}
            disabled={isChecking}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
            Verificar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Status Resumido */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 bg-slate-50 rounded">
            <div className="text-lg font-bold text-blue-600">
              {diagnostic?.hasActiveCompetition ? '1' : '0'}
            </div>
            <div className="text-xs text-slate-600">Ativa</div>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded">
            <div className="text-lg font-bold text-orange-600">
              {diagnostic?.scheduledCompetitions?.length || 0}
            </div>
            <div className="text-xs text-slate-600">Agendadas</div>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded">
            <div className="text-lg font-bold text-green-600">
              {diagnostic?.usersWithScores || 0}
            </div>
            <div className="text-xs text-slate-600">Usuários</div>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded">
            <div className="text-lg font-bold text-purple-600">
              {diagnostic?.currentRankingEntries || 0}
            </div>
            <div className="text-xs text-slate-600">Rankings</div>
          </div>
        </div>

        {/* Problemas Identificados */}
        {diagnostic?.issues && diagnostic.issues.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-1">
              <AlertTriangle className="h-4 w-4" />
              Problemas Identificados
            </div>
            <ul className="text-sm text-amber-600 space-y-1">
              {diagnostic.issues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Ação de Ativação Manual */}
        {needsActivation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-900">Ativação Necessária</div>
                <div className="text-xs text-blue-600">
                  Competições agendadas precisam ser ativadas manualmente
                </div>
              </div>
              <Button
                onClick={handleForceActivation}
                disabled={isActivating}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isActivating ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Ativando...
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3 mr-1" />
                    Ativar Competições
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
