
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useWeeklyConfig } from '@/hooks/useWeeklyConfig';
import { useWeeklyCompetitionHistory } from '@/hooks/useWeeklyCompetitionHistory';
import { useWeeklyCompetitionActivation } from '@/hooks/useWeeklyCompetitionActivation';
import { formatDateForDisplay } from '@/utils/dateFormatters';

interface WeeklyConfig {
  id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'scheduled' | 'ended' | 'completed';
  activated_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useWeeklyConfigModal = (onConfigUpdated: () => void) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedCompetition, setSelectedCompetition] = useState<WeeklyConfig | null>(null);

  const {
    activeConfig,
    scheduledConfigs,
    lastCompletedConfig,
    isLoading: configsLoading,
    loadConfigurations,
    scheduleCompetition,
    finalizeCompetition,
    calculateNextDates
  } = useWeeklyConfig();

  const { activateWeeklyCompetitions, isActivating } = useWeeklyCompetitionActivation();

  const {
    historyData: weeklyHistoryData,
    isLoading: historyLoading,
    totalPages: historyTotalPages,
    refetch: refetchHistory
  } = useWeeklyCompetitionHistory(historyPage, 10);

  const handleActivateCompetitions = async () => {
    const result = await activateWeeklyCompetitions();
    
    if (result.success && result.data) {
      if (result.data.updated_count > 0) {
        toast({
          title: "Competições Atualizadas!",
          description: `${result.data.updated_count} competição(ões) foram atualizadas com sucesso.`,
        });
        await loadConfigurations();
        onConfigUpdated();
      } else {
        toast({
          title: "Nenhuma Atualização",
          description: "Todas as competições já estão com o status correto.",
        });
      }
    } else {
      toast({
        title: "Erro",
        description: `Erro ao ativar competições: ${result.error}`,
        variant: "destructive",
      });
    }
  };

  const handleScheduleNew = async () => {
    try {
      setIsLoading(true);

      const result = await scheduleCompetition(newStartDate, newEndDate);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: `Nova competição agendada de ${formatDateForDisplay(newStartDate)} a ${formatDateForDisplay(newEndDate)}`,
        });

        onConfigUpdated();
        
        const nextStart = new Date(newEndDate);
        nextStart.setDate(nextStart.getDate() + 1);
        const nextEnd = new Date(nextStart);
        nextEnd.setDate(nextEnd.getDate() + 6);
        
        setNewStartDate(nextStart.toISOString().split('T')[0]);
        setNewEndDate(nextEnd.toISOString().split('T')[0]);
      } else {
        throw new Error(result.error);
      }

    } catch (error: any) {
      console.error('Erro ao agendar nova competição:', error);
      toast({
        title: "Erro",
        description: `Erro ao agendar competição: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!activeConfig && !scheduledConfigs.some(c => c.status === 'ended')) {
      toast({
        title: "Erro",
        description: "Nenhuma competição ativa ou finalizada para processar",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const result = await finalizeCompetition();

      if (result.success) {
        toast({
          title: "Competição Finalizada!",
          description: `Competição finalizada com ${result.data.winners_count || 0} ganhadores. Snapshot criado com sucesso.`,
        });

        onConfigUpdated();
        refetchHistory();
      } else {
        throw new Error(result.error);
      }

    } catch (error: any) {
      console.error('Erro ao finalizar competição:', error);
      toast({
        title: "Erro",
        description: `Erro ao finalizar competição: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular próximas datas quando o modal abre
  useEffect(() => {
    if (!newStartDate && !newEndDate) {
      const nextDates = calculateNextDates();
      setNewStartDate(nextDates.startDate);
      setNewEndDate(nextDates.endDate);
    }
  }, [activeConfig, scheduledConfigs, lastCompletedConfig, calculateNextDates, newStartDate, newEndDate]);

  return {
    // Estados
    isLoading,
    newStartDate,
    newEndDate,
    historyPage,
    selectedCompetition,
    // Configurações
    activeConfig,
    scheduledConfigs,
    lastCompletedConfig,
    configsLoading,
    isActivating,
    // Dados do histórico
    weeklyHistoryData,
    historyLoading,
    historyTotalPages,
    // Setters
    setNewStartDate,
    setNewEndDate,
    setHistoryPage,
    setSelectedCompetition,
    // Handlers
    handleActivateCompetitions,
    handleScheduleNew,
    handleFinalize,
    // Funções auxiliares
    loadConfigurations,
    refetchHistory
  };
};
