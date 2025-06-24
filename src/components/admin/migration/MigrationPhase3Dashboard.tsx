
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw,
  Database,
  Zap
} from 'lucide-react';
import { migrationCleanupService } from '@/services/migrationCleanupService';
import { useToast } from "@/hooks/use-toast";
import { secureLogger } from '@/utils/secureLogger';
import { MigrationPhase3Header } from './phase3/MigrationPhase3Header';
import { CleanupItemCard } from './phase3/CleanupItemCard';
import { BlockersAlert } from './phase3/BlockersAlert';
import { FullCleanupSection } from './phase3/FullCleanupSection';
import { CleanupSuccessStatus } from './phase3/CleanupSuccessStatus';

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
      <MigrationPhase3Header 
        cleanupStatus={cleanupStatus}
        isLoading={isLoading}
        onRefresh={loadCleanupStatus}
      />

      <BlockersAlert blockers={cleanupStatus.blockers} />

      {/* Itens para Limpeza */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CleanupItemCard
          title="Sessões Órfãs"
          icon={<Database className="h-4 w-4" />}
          count={cleanupStatus.orphanedSessions}
          description="Sessões de jogo completadas que não estão vinculadas a nenhuma competição"
          onCleanup={() => handleSpecificCleanup('orphaned')}
          isExecuting={isExecutingCleanup}
          titleColor="text-orange-700"
          countColor="text-orange-600"
          bgColor="bg-orange-50 text-orange-800"
        />

        <CleanupItemCard
          title="Competições Legadas"
          icon={<Zap className="h-4 w-4" />}
          count={cleanupStatus.legacyCompetitions}
          description="Competições diárias que ainda dependem de torneios semanais"
          onCleanup={() => handleSpecificCleanup('legacy')}
          isExecuting={isExecutingCleanup}
          titleColor="text-yellow-700"
          countColor="text-yellow-600"
          bgColor="bg-yellow-50 text-yellow-800"
        />

        <CleanupItemCard
          title="Torneios Antigos"
          icon={<Database className="h-4 w-4" />}
          count={cleanupStatus.unusedWeeklyTournaments}
          description="Torneios semanais concluídos que não possuem competições vinculadas"
          onCleanup={() => handleSpecificCleanup('tournaments')}
          isExecuting={isExecutingCleanup}
          titleColor="text-purple-700"
          countColor="text-purple-600"
          bgColor="bg-purple-50 text-purple-800"
        />
      </div>

      <FullCleanupSection 
        cleanupStatus={cleanupStatus}
        isExecuting={isExecutingCleanup}
        onFullCleanup={handleFullCleanup}
      />

      <CleanupSuccessStatus cleanupSafe={cleanupStatus.cleanupSafe} />
    </div>
  );
};
