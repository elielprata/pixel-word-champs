
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Database,
  Shield,
  Zap
} from 'lucide-react';
import { migrationCleanupService } from '@/services/migrationCleanupService';
import { useToast } from "@/hooks/use-toast";
import { secureLogger } from '@/utils/secureLogger';

interface CleanupStatus {
  legacyCompetitions: number;
  orphanedSessions: number;
  unusedWeeklyTournaments: number;
  cleanupSafe: boolean;
  blockers: string[];
}

export const MigrationPhase3Dashboard = () => {
  const { toast } = useToast();
  const [cleanupStatus, setCleanupStatus] = useState<CleanupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecutingCleanup, setIsExecutingCleanup] = useState(false);

  const loadCleanupStatus = async () => {
    setIsLoading(true);
    try {
      const status = await migrationCleanupService.getCleanupStatus();
      setCleanupStatus(status);
      
      secureLogger.info('Status de limpeza carregado', { status }, 'MIGRATION_PHASE3');
      
    } catch (error) {
      secureLogger.error('Erro ao carregar status de limpeza', { error }, 'MIGRATION_PHASE3');
      toast({
        title: "Erro",
        description: "Falha ao carregar status de limpeza",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCleanupStatus();
  }, []);

  const handleFullCleanup = async () => {
    if (!cleanupStatus?.cleanupSafe) {
      toast({
        title: "Limpeza Bloqueada",
        description: "Existem bloqueadores que impedem a limpeza segura",
        variant: "destructive",
      });
      return;
    }

    setIsExecutingCleanup(true);
    try {
      const result = await migrationCleanupService.performFullCleanup();
      
      if (result.success) {
        toast({
          title: "✅ Limpeza Concluída",
          description: `${result.itemsRemoved} itens removidos com sucesso`,
        });
        
        // Recarregar status
        await loadCleanupStatus();
      } else {
        throw new Error(result.error || 'Erro na limpeza');
      }
      
    } catch (error) {
      secureLogger.error('Erro na limpeza completa', { error }, 'MIGRATION_PHASE3');
      toast({
        title: "Erro na Limpeza",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsExecutingCleanup(false);
    }
  };

  const handleSpecificCleanup = async (type: 'orphaned' | 'legacy' | 'tournaments') => {
    setIsExecutingCleanup(true);
    try {
      let result;
      
      switch (type) {
        case 'orphaned':
          result = await migrationCleanupService.cleanOrphanedSessions();
          break;
        case 'legacy':
          result = await migrationCleanupService.cleanLegacyCompetitions();
          break;
        case 'tournaments':
          result = await migrationCleanupService.cleanUnusedWeeklyTournaments();
          break;
      }
      
      if (result.success) {
        toast({
          title: "✅ Limpeza Específica Concluída",
          description: `${result.itemsRemoved} itens removidos`,
        });
        await loadCleanupStatus();
      } else {
        throw new Error(result.error || 'Erro na limpeza específica');
      }
      
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro na limpeza específica",
        variant: "destructive",
      });
    } finally {
      setIsExecutingCleanup(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando status de limpeza...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cleanupStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>Falha ao carregar status de limpeza</p>
            <Button onClick={loadCleanupStatus} className="mt-2">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da Fase 3 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Fase 3: Limpeza Final - Remoção de Componentes Legados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Remoção segura de dados redundantes e componentes não utilizados
              </p>
              <div className="flex items-center gap-4">
                {cleanupStatus.cleanupSafe ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Shield className="h-3 w-3 mr-1" />
                    Limpeza Segura
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Bloqueadores Detectados
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              onClick={loadCleanupStatus} 
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

      {/* Status dos Bloqueadores */}
      {cleanupStatus.blockers.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Bloqueadores Detectados:</strong>
            <ul className="mt-2 space-y-1">
              {cleanupStatus.blockers.map((blocker, index) => (
                <li key={index} className="text-sm">• {blocker}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Itens para Limpeza */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sessões Órfãs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Database className="h-4 w-4" />
              Sessões Órfãs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-3xl font-bold text-orange-600">
                  {cleanupStatus.orphanedSessions}
                </span>
                <p className="text-sm text-gray-600">Sessões sem vinculação</p>
              </div>
              
              <div className="bg-orange-50 p-3 rounded-lg text-sm text-orange-800">
                Sessões de jogo completadas que não estão vinculadas a nenhuma competição
              </div>
              
              <Button 
                onClick={() => handleSpecificCleanup('orphaned')}
                disabled={isExecutingCleanup || cleanupStatus.orphanedSessions === 0}
                className="w-full"
                variant="outline"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Sessões Órfãs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Competições Legadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Zap className="h-4 w-4" />
              Competições Legadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-3xl font-bold text-yellow-600">
                  {cleanupStatus.legacyCompetitions}
                </span>
                <p className="text-sm text-gray-600">Competições vinculadas</p>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                Competições diárias que ainda dependem de torneios semanais
              </div>
              
              <Button 
                onClick={() => handleSpecificCleanup('legacy')}
                disabled={isExecutingCleanup || cleanupStatus.legacyCompetitions === 0}
                className="w-full"
                variant="outline"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Competições Legadas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Torneios Não Utilizados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Database className="h-4 w-4" />
              Torneios Antigos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-3xl font-bold text-purple-600">
                  {cleanupStatus.unusedWeeklyTournaments}
                </span>
                <p className="text-sm text-gray-600">Torneios finalizados</p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-800">
                Torneios semanais concluídos que não possuem competições vinculadas
              </div>
              
              <Button 
                onClick={() => handleSpecificCleanup('tournaments')}
                disabled={isExecutingCleanup || cleanupStatus.unusedWeeklyTournaments === 0}
                className="w-full"
                variant="outline"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Torneios Antigos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Limpeza Completa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-700">⚡ Limpeza Completa do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Ação Irreversível</h4>
              <p className="text-sm text-red-700 mb-3">
                Esta ação irá remover todos os componentes legados identificados. 
                Certifique-se de que o sistema independente está funcionando corretamente.
              </p>
              <div className="space-y-2 text-sm text-red-700">
                <p>• Remover {cleanupStatus.orphanedSessions} sessões órfãs</p>
                <p>• Remover {cleanupStatus.legacyCompetitions} competições legadas</p>
                <p>• Remover {cleanupStatus.unusedWeeklyTournaments} torneios antigos</p>
              </div>
            </div>

            <Button 
              onClick={handleFullCleanup}
              disabled={isExecutingCleanup || !cleanupStatus.cleanupSafe}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isExecutingCleanup ? 'Executando Limpeza...' : 'Executar Limpeza Completa'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Final */}
      {cleanupStatus.cleanupSafe && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Sistema Pronto para Limpeza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <p className="text-green-800 font-medium">✅ Todos os pré-requisitos atendidos</p>
              <p className="text-sm text-green-700">
                O sistema está seguro para a remoção dos componentes legados. 
                Após a limpeza, o sistema funcionará exclusivamente com o novo modelo independente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
