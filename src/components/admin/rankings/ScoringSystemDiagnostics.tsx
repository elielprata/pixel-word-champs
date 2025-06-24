
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Settings,
  Zap,
  Database,
  Users,
  Trophy,
  Loader2
} from 'lucide-react';
import { useScoringSyncManagement } from '@/hooks/useScoringSyncManagement';

export const ScoringSystemDiagnostics = () => {
  const {
    validationResult,
    fixResult,
    autoUpdateEnabled,
    isLoading,
    isValidating,
    isFixing,
    validateIntegrity,
    fixOrphanedScores,
    syncScores,
    toggleAutoUpdate
  } = useScoringSyncManagement();

  const hasIssues = validationResult && !validationResult.validation_passed;

  return (
    <div className="space-y-6">
      {/* Configurações de Auto-Update */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Configurações do Sistema
            </CardTitle>
            <Badge variant={autoUpdateEnabled ? "default" : "secondary"}>
              {autoUpdateEnabled ? "Automático" : "Manual"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Atualização Automática do Ranking</p>
              <p className="text-sm text-gray-600">
                Sincronizar pontuações automaticamente quando houver mudanças
              </p>
            </div>
            <Switch
              checked={autoUpdateEnabled}
              onCheckedChange={toggleAutoUpdate}
            />
          </div>
        </CardContent>
      </Card>

      {/* Validação de Integridade */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              Validação de Integridade
            </CardTitle>
            <Button 
              onClick={validateIntegrity} 
              disabled={isValidating}
              variant="outline"
              size="sm"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Validar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {validationResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {validationResult.users_with_completed_sessions}
                  </p>
                  <p className="text-xs text-blue-600">Com Sessões</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {validationResult.users_with_scores}
                  </p>
                  <p className="text-xs text-green-600">Com Pontos</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Database className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {validationResult.users_in_current_ranking}
                  </p>
                  <p className="text-xs text-purple-600">No Ranking</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-700">
                    {validationResult.orphaned_sessions}
                  </p>
                  <p className="text-xs text-orange-600">Órfãs</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status da Validação</span>
                  <Badge variant={validationResult.validation_passed ? "default" : "destructive"}>
                    {validationResult.validation_passed ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Íntegro
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Problemas
                      </>
                    )}
                  </Badge>
                </div>
                
                {hasIssues && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800 mb-2">
                      Problemas Encontrados:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationResult.issues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Clique em "Validar" para verificar a integridade</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações de Correção */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Correção de Pontuações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Corrige discrepâncias entre sessões completadas e pontuações dos perfis
            </p>
            
            <Button 
              onClick={fixOrphanedScores} 
              disabled={isFixing}
              className="w-full"
            >
              {isFixing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Corrigir Pontuações Órfãs
            </Button>

            {fixResult && fixResult.fixed_users_count > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800">
                  ✅ {fixResult.fixed_users_count} usuário(s) corrigido(s)
                </p>
                {fixResult.ranking_updated && (
                  <p className="text-xs text-green-600 mt-1">
                    Ranking semanal atualizado automaticamente
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Sincronização Manual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Força a sincronização imediata das pontuações com o ranking semanal
            </p>
            
            <Button 
              onClick={syncScores} 
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sincronizar Agora
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
