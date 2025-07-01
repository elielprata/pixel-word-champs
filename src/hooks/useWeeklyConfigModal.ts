
import { useState, useEffect } from 'react';
import { useWeeklyConfig } from './useWeeklyConfig';
import { useWeeklyCompetitionActivation } from './useWeeklyCompetitionActivation';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

// Hook simplificado que cria um histórico básico simulado
const useWeeklyConfigHistory = () => {
  return {
    weeklyHistoryData: { data: [], totalCount: 0 },
    historyLoading: false,
    historyPage: 1,
    historyTotalPages: 1,
    setHistoryPage: () => {},
    refetchHistory: async () => {}
  };
};

export const useWeeklyConfigModal = (onConfigUpdated: () => void) => {
  const [selectedCompetition, setSelectedCompetition] = useState<any>(null);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    activeConfig,
    scheduledConfigs,
    completedConfigs,
    lastCompletedConfig,
    isLoading: configsLoading,
    loadConfigurations,
    scheduleCompetition,
    finalizeCompetition,
    calculateNextDates
  } = useWeeklyConfig();

  const {
    weeklyHistoryData,
    historyLoading,
    historyPage,
    historyTotalPages,
    setHistoryPage,
    refetchHistory
  } = useWeeklyConfigHistory();

  const { activateWeeklyCompetitions, isActivating } = useWeeklyCompetitionActivation();

  // Calcular próximas datas automaticamente
  useEffect(() => {
    const nextDates = calculateNextDates();
    setNewStartDate(nextDates.startDate);
    setNewEndDate(nextDates.endDate);
  }, [scheduledConfigs, activeConfig, lastCompletedConfig]);

  const handleActivateCompetitions = async () => {
    console.log('🎯 Ativando competições semanais manualmente', {
      timestamp: getCurrentBrasiliaTime()
    });

    const result = await activateWeeklyCompetitions();
    
    if (result.success) {
      console.log('✅ Competições ativadas com sucesso:', result.data);
      await loadConfigurations();
      onConfigUpdated();
    } else {
      console.error('❌ Erro ao ativar competições:', result.error);
    }
  };

  const handleScheduleNew = async () => {
    if (!newStartDate || !newEndDate) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await scheduleCompetition(newStartDate, newEndDate);
      
      if (result.success) {
        console.log('✅ Nova competição agendada com sucesso');
        await loadConfigurations();
        onConfigUpdated();
      } else {
        console.error('❌ Erro ao agendar competição:', result.error);
      }
    } catch (error) {
      console.error('❌ Erro ao agendar competição:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    setIsLoading(true);
    try {
      console.log('🏁 Finalizando competição semanal manualmente', {
        timestamp: getCurrentBrasiliaTime()
      });

      const result = await finalizeCompetition();
      
      if (result.success) {
        console.log('✅ Competição finalizada com sucesso:', result.data);
        await loadConfigurations();
        await refetchHistory();
        onConfigUpdated();
      } else {
        console.error('❌ Erro ao finalizar competição:', result.error);
      }
    } catch (error) {
      console.error('❌ Erro ao finalizar competição:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estados
    activeConfig,
    scheduledConfigs,
    completedConfigs,
    lastCompletedConfig,
    configsLoading,
    isActivating,
    isLoading,
    selectedCompetition,
    newStartDate,
    newEndDate,
    
    // Histórico
    weeklyHistoryData,
    historyLoading,
    historyPage,
    historyTotalPages,
    
    // Ações
    setSelectedCompetition,
    setNewStartDate,
    setNewEndDate,
    setHistoryPage,
    handleActivateCompetitions,
    handleScheduleNew,
    handleFinalize,
    loadConfigurations,
    refetchHistory
  };
};
