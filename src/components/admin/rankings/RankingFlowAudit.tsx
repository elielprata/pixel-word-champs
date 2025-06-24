
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, RefreshCw, Database, Users, Trophy } from 'lucide-react';
import { useRankingFlowAudit } from '@/hooks/useRankingFlowAudit';
import { Loader2 } from 'lucide-react';

export const RankingFlowAudit = () => {
  const { auditData, isLoading, error, refetch } = useRankingFlowAudit();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Auditoria do Fluxo de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-gray-600">Analisando fluxo de dados...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Erro na Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <Button onClick={refetch} className="mt-4" variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!auditData) return null;

  const hasIssues = auditData.dataConsistencyIssues.length > 0;
  const isDataFlowHealthy = 
    auditData.profilesWithScores > 0 && 
    auditData.weeklyRankingEntries > 0 && 
    !hasIssues;

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Status da Auditoria do Fluxo de Dados
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isDataFlowHealthy ? "default" : "destructive"}
                className={isDataFlowHealthy ? "bg-green-100 text-green-800" : ""}
              >
                {isDataFlowHealthy ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Saudável
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Problemas Detectados
                  </>
                )}
              </Badge>
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Participação</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {auditData.profilesWithSessions}
                  </p>
                  <p className="text-xs text-blue-500">usuários com sessões</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Pontuação</p>
                  <p className="text-2xl font-bold text-green-700">
                    {auditData.profilesWithScores}
                  </p>
                  <p className="text-xs text-green-500">usuários com pontos</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Ranking</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {auditData.weeklyRankingEntries}
                  </p>
                  <p className="text-xs text-purple-500">entradas no ranking</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes da Auditoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Métricas Detalhadas */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas Detalhadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Sessões Órfãs</span>
              <Badge variant={auditData.orphanedSessions > 0 ? "destructive" : "secondary"}>
                {auditData.orphanedSessions}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Competições Ativas</span>
              <Badge variant="outline">
                {auditData.activeCompetitions}
              </Badge>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Participações Registradas</span>
              <Badge variant="outline">
                {auditData.participationEntries}
              </Badge>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Última Atualização</span>
              <span className="text-xs text-gray-500">
                {auditData.lastRankingUpdate 
                  ? new Date(auditData.lastRankingUpdate).toLocaleString('pt-BR')
                  : 'Nunca'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Problemas de Consistência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasIssues ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              Consistência dos Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasIssues ? (
              <div className="space-y-3">
                <p className="text-sm text-red-600 font-medium">
                  {auditData.dataConsistencyIssues.length} problema(s) detectado(s):
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {auditData.dataConsistencyIssues.map((issue, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-xs text-red-800">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-sm text-green-700 font-medium">
                  Nenhum problema de consistência detectado
                </p>
                <p className="text-xs text-green-600 mt-1">
                  O fluxo de dados está funcionando corretamente
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
