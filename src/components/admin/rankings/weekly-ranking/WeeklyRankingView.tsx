
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy, Settings, Award, CheckCircle, Calculator } from 'lucide-react';
import { WeeklyRankingTable } from './WeeklyRankingTable';
import { WeeklyRankingStats } from './WeeklyRankingStats';
import { WeeklyConfigModal } from './WeeklyConfigModal';
import { PrizeConfigModal } from '../PrizeConfigModal';
import { useWeeklyRanking } from '@/hooks/useWeeklyRanking';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { weeklyRankingUpdateService } from '@/services/weeklyRankingUpdateService';

export const WeeklyRankingView = () => {
  const { toast } = useToast();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [prizeConfigModalOpen, setPrizeConfigModalOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidatingPrizes, setIsValidatingPrizes] = useState(false);
  const { 
    currentRanking, 
    stats, 
    isLoading, 
    error, 
    refetch,
    updateRanking,
    validateIntegrity
  } = useWeeklyRanking();

  const handleRefresh = async () => {
    const result = await updateRanking();
    if (result.success) {
      toast({
        title: "Atualizado",
        description: "Ranking semanal atualizado com sucesso usando premiação dinâmica!",
      });
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao atualizar ranking",
        variant: "destructive"
      });
    }
  };

  const handleValidateIntegrity = async () => {
    setIsValidating(true);
    try {
      const result = await validateIntegrity();
      
      if (result.hasDuplicates) {
        toast({
          title: "Duplicatas Detectadas",
          description: `Encontradas ${result.duplicatesCount} duplicatas no ranking`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Integridade Verificada",
          description: "Nenhuma duplicata encontrada no ranking semanal",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na Validação",
        description: "Erro ao verificar integridade do ranking",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleValidatePrizesCalculation = async () => {
    setIsValidatingPrizes(true);
    try {
      const result = await weeklyRankingUpdateService.validatePrizeCalculations();
      
      // Verificar se há discrepâncias na premiação
      const discrepancies = result.prizeValidation.filter(entry => 
        entry.currentPrize !== entry.expectedPrize
      );

      if (discrepancies.length > 0) {
        toast({
          title: "Discrepâncias na Premiação",
          description: `${discrepancies.length} posições com prêmios incorretos. Atualize o ranking para corrigir.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Premiação Validada",
          description: "Todos os prêmios estão corretos conforme as configurações",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na Validação",
        description: "Erro ao validar cálculos de premiação",
        variant: "destructive"
      });
    } finally {
      setIsValidatingPrizes(false);
    }
  };

  const handleConfigUpdated = () => {
    refetch();
    toast({
      title: "Configuração atualizada",
      description: "Configurações do ranking semanal foram atualizadas!",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-sm text-gray-600">Carregando ranking semanal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botões */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Ranking Semanal
          </h2>
          <p className="text-sm text-slate-600">Classificação dos jogadores da semana com premiação dinâmica</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setConfigModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Configurar Competição
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setPrizeConfigModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Award className="h-4 w-4" />
            Configurar Premiação
          </Button>
          <Button 
            variant="outline" 
            onClick={handleValidatePrizesCalculation}
            disabled={isValidatingPrizes}
            className="flex items-center gap-2"
          >
            {isValidatingPrizes ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4" />
            )}
            Validar Premiação
          </Button>
          <Button 
            variant="outline" 
            onClick={handleValidateIntegrity}
            disabled={isValidating}
            className="flex items-center gap-2"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Validar Integridade
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas Básicas */}
      <WeeklyRankingStats stats={stats} onConfigUpdated={refetch} />

      {/* Tabela de Ranking */}
      <WeeklyRankingTable ranking={currentRanking} />

      {/* Modal de Configuração */}
      <WeeklyConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        onConfigUpdated={handleConfigUpdated}
      />

      {/* Modal de Configuração de Premiação */}
      <PrizeConfigModal
        open={prizeConfigModalOpen}
        onOpenChange={setPrizeConfigModalOpen}
      />
    </div>
  );
};
