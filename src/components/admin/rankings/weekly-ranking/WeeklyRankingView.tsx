
import React, { useState } from 'react';
import { useWeeklyConfig } from '@/hooks/useWeeklyConfig';
import { WeeklyConfigOverview } from './WeeklyConfigOverview';
import { WeeklyConfigScheduler } from './WeeklyConfigScheduler';
import { WeeklyConfigHistory } from './WeeklyConfigHistory';
import { WeeklyRankingStats } from './WeeklyRankingStats';
import { WeeklyFinalizationMonitor } from './WeeklyFinalizationMonitor';
import { WeeklyConfigModal } from './WeeklyConfigModal';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Trophy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WeeklyRankingView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  const {
    activeConfig,
    scheduledConfigs,
    completedConfigs,
    isLoading,
    error,
    loadConfigurations,
    scheduleCompetition,
    finalizeCompetition
  } = useWeeklyConfig();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async () => {
    if (!newStartDate || !newEndDate) return;
    
    const result = await scheduleCompetition(newStartDate, newEndDate);
    if (result.success) {
      handleCloseModal();
      loadConfigurations();
    }
  };

  const handleFinalize = async () => {
    await finalizeCompetition();
    loadConfigurations();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-80 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-lg border border-slate-200">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Erro ao Carregar Dados</h3>
        <p className="text-slate-600 mb-6 max-w-md">{error}</p>
        <Button onClick={loadConfigurations} size="lg">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // Criar stats mockado para WeeklyRankingStats
  const mockStats = {
    current_week_start: activeConfig?.start_date || null,
    current_week_end: activeConfig?.end_date || null,
    total_participants: 0,
    total_prize_pool: 0,
    last_update: new Date().toISOString(),
    config: activeConfig ? {
      start_date: activeConfig.start_date,
      end_date: activeConfig.end_date,
      status: activeConfig.status
    } : null,
    no_active_competition: !activeConfig,
    competition_status: activeConfig?.status || 'completed',
    message: activeConfig ? 'Competição ativa' : 'Nenhuma competição ativa'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Ranking Semanal</h2>
            <p className="text-slate-600">Gestão completa das competições semanais</p>
          </div>
        </div>
        <Button onClick={handleOpenModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Competição
        </Button>
      </div>

      {/* Monitor de Finalização Automática */}
      <WeeklyFinalizationMonitor />

      {/* Estatísticas do Ranking */}
      <WeeklyRankingStats 
        stats={mockStats}
        onConfigUpdated={loadConfigurations}
      />

      {/* Visão Geral das Configurações */}
      <WeeklyConfigOverview 
        activeConfig={activeConfig}
        scheduledConfigs={scheduledConfigs}
        isLoading={isLoading}
        onEdit={() => {}}
        onDelete={() => {}}
        onActivate={() => {}}
        isActivating={false}
      />

      {/* Histórico de Competições */}
      <WeeklyConfigHistory 
        configs={completedConfigs}
        isLoading={isLoading}
        onEdit={() => {}}
        onDelete={() => {}}
        onView={() => {}}
      />

      {/* Modal de Configuração */}
      <WeeklyConfigModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onConfigUpdated={loadConfigurations}
      />
    </div>
  );
};
