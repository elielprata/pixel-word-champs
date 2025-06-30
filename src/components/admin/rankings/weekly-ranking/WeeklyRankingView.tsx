
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trophy, Settings, Award } from 'lucide-react';
import { WeeklyRankingTable } from './WeeklyRankingTable';
import { WeeklyRankingStats } from './WeeklyRankingStats';
import { WeeklyConfigModal } from './WeeklyConfigModal';
import { WeeklyAutomationStatus } from './WeeklyAutomationStatus';
import { PrizeConfigModal } from '../PrizeConfigModal';
import { useWeeklyRanking } from '@/hooks/useWeeklyRanking';
import { Loader2 } from 'lucide-react';

export const WeeklyRankingView = () => {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [prizeConfigModalOpen, setPrizeConfigModalOpen] = useState(false);
  const { 
    currentRanking, 
    stats, 
    isLoading, 
    error, 
    refetch
  } = useWeeklyRanking();

  const handleConfigUpdated = () => {
    refetch();
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
      {/* Header com botões essenciais apenas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Ranking Semanal
          </h2>
          <p className="text-sm text-slate-600">Classificação dos jogadores da semana - Atualização automática</p>
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
        </div>
      </div>

      {/* Status da Automação */}
      <WeeklyAutomationStatus />

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
