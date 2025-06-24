
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Database,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { migrationImpactAnalysisService } from '@/services/migrationImpactAnalysis';
import { useToast } from "@/hooks/use-toast";
import { secureLogger } from '@/utils/secureLogger';

interface DependencyAnalysis {
  totalDailyCompetitions: number;
  dailyCompetitionsWithWeeklyLink: number;
  activeWeeklyTournaments: number;
  orphanedDailyCompetitions: number;
  weeklyRankingUsers: number;
  completedSessionsWithoutCompetition: number;
  totalCompletedSessions: number;
  systemHealthStatus: 'safe' | 'warning' | 'critical';
  migrationRisks: string[];
  recommendations: string[];
}

export const MigrationImpactDashboard = () => {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<DependencyAnalysis | null>(null);
  const [migrationPlan, setMigrationPlan] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAnalysis = async () => {
    setIsLoading(true);
    try {
      secureLogger.info('Carregando análise de impacto da migração', undefined, 'MIGRATION_DASHBOARD');
      
      const [analysisResult, planResult] = await Promise.all([
        migrationImpactAnalysisService.performFullSystemAnalysis(),
        migrationImpactAnalysisService.generateMigrationPlan()
      ]);
      
      setAnalysis(analysisResult);
      setMigrationPlan(planResult);
      
      toast({
        title: "Análise Concluída",
        description: `Status do sistema: ${analysisResult.systemHealthStatus.toUpperCase()}`,
      });
      
    } catch (error) {
      secureLogger.error('Erro ao carregar análise', { error }, 'MIGRATION_DASHBOARD');
      toast({
        title: "Erro",
        description: "Falha ao carregar análise de impacto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Analisando impacto da migração...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>Falha ao carregar análise</p>
            <Button onClick={loadAnalysis} className="mt-2">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Análise de Impacto da Migração - Fase 1
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {getHealthStatusIcon(analysis.systemHealthStatus)}
            <Badge className={getHealthStatusColor(analysis.systemHealthStatus)}>
              Status: {analysis.systemHealthStatus.toUpperCase()}
            </Badge>
            <Button 
              onClick={loadAnalysis} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{analysis.totalDailyCompetitions}</p>
                <p className="text-sm text-gray-600">Competições Diárias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{analysis.dailyCompetitionsWithWeeklyLink}</p>
                <p className="text-sm text-gray-600">Com Vinculação Semanal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{analysis.weeklyRankingUsers}</p>
                <p className="text-sm text-gray-600">Usuários no Ranking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{analysis.completedSessionsWithoutCompetition}</p>
                <p className="text-sm text-gray-600">Sessões Órfãs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Riscos e Recomendações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">🚨 Riscos Identificados</CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.migrationRisks.length === 0 ? (
              <p className="text-green-600">✅ Nenhum risco crítico identificado</p>
            ) : (
              <ul className="space-y-2">
                {analysis.migrationRisks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{risk}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">💡 Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Plano de Migração */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Plano de Migração Recomendado</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {migrationPlan.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {index + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Status de Dependências Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Análise Detalhada de Dependências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Competições Diárias</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{analysis.totalDailyCompetitions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Com vinculação semanal:</span>
                  <span className="text-yellow-600">{analysis.dailyCompetitionsWithWeeklyLink}</span>
                </div>
                <div className="flex justify-between">
                  <span>Independentes:</span>
                  <span className="text-green-600">{analysis.orphanedDailyCompetitions}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Sistema de Sessões</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Total de sessões:</span>
                  <span>{analysis.totalCompletedSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sessões órfãs:</span>
                  <span className="text-red-600">{analysis.completedSessionsWithoutCompetition}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de órfãs:</span>
                  <span>
                    {analysis.totalCompletedSessions > 0 
                      ? ((analysis.completedSessionsWithoutCompetition / analysis.totalCompletedSessions) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Final */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Fase 1 Completa:</strong> Análise de impacto realizada. 
          {analysis.systemHealthStatus === 'safe' 
            ? ' Sistema seguro para migração. Prossiga para Fase 2.' 
            : ' Atenção necessária antes de prosseguir. Revise os riscos identificados.'}
        </AlertDescription>
      </Alert>
    </div>
  );
};
