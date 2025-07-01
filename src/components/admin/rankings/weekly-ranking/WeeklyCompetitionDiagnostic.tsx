
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, RefreshCw, Settings, Zap } from 'lucide-react';
import { useWeeklyCompetitionDiagnostic } from '@/hooks/useWeeklyCompetitionDiagnostic';
import { formatDateForDisplay } from '@/utils/dateFormatters';
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

    switch (diagnostic.systemStatus) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Saudável</Badge>;
      case 'needs_attention':
        return <Badge variant="secondary" className="bg-yellow-600"><AlertTriangle className="h-3 w-3 mr-1" />Atenção</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Erro</Badge>;
    }
  };

  if (!diagnostic && isChecking) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Executando diagnóstico...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Diagnóstico do Sistema
            </CardTitle>
            <CardDescription>
              Status das competições semanais e verificações automáticas
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={runDiagnostic}
              disabled={isChecking}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
              Verificar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status das Competições */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {diagnostic?.hasActiveCompetition ? '1' : '0'}
            </div>
            <div className="text-sm text-slate-600">Ativa</div>
          </div>
          
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {diagnostic?.scheduledCompetitions?.length || 0}
            </div>
            <div className="text-sm text-slate-600">Agendadas</div>
          </div>
          
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {diagnostic?.usersWithScores || 0}
            </div>
            <div className="text-sm text-slate-600">Usuários c/ Pontos</div>
          </div>
          
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {diagnostic?.currentRankingEntries || 0}
            </div>
            <div className="text-sm text-slate-600">Ranking Atual</div>
          </div>
        </div>

        {/* Competições Agendadas */}
        {diagnostic?.scheduledCompetitions && diagnostic.scheduledCompetitions.length > 0 && (
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Competições Agendadas</h4>
            <div className="space-y-2">
              {diagnostic.scheduledCompetitions.map((competition) => (
                <div key={competition.id} className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-sm">
                    <span className="font-medium">
                      {formatDateForDisplay(competition.start_date)} - {formatDateForDisplay(competition.end_date)}
                    </span>
                    <span className="text-slate-600 ml-2">({competition.status})</span>
                  </div>
                  <Badge variant="outline" className="text-yellow-700">Aguardando Ativação</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues */}
        {diagnostic?.issues && diagnostic.issues.length > 0 && (
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Problemas Identificados</h4>
            <div className="space-y-1">
              {diagnostic.issues.map((issue, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  {issue}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ação de Ativação */}
        {diagnostic?.hasScheduledCompetitions && !diagnostic?.hasActiveCompetition && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">Ativação Manual</h4>
                <p className="text-sm text-slate-600">
                  Forçar ativação das competições agendadas que deveriam estar ativas
                </p>
              </div>
              <Button
                onClick={handleForceActivation}
                disabled={isActivating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isActivating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Ativando...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
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
