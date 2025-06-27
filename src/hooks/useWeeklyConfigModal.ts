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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteCompletedModalOpen, setDeleteCompletedModalOpen] = useState(false);
  const [activeCompetitionErrorOpen, setActiveCompetitionErrorOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<WeeklyConfig | null>(null);
  const [historyPage, setHistoryPage] = useState(1);

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

  const initializeDates = (open: boolean) => {
    if (open && !newStartDate && !newEndDate) {
      const nextDates = calculateNextDates();
      setNewStartDate(nextDates.startDate);
      setNewEndDate(nextDates.endDate);
    }
  };

  // Função para verificar se é erro de competição ativa duplicada
  const isActiveCompetitionError = (error: any): boolean => {
    if (!error) return false;
    
    const errorMessage = typeof error === 'string' ? error : error.message || '';
    const errorCode = error.code || '';
    
    console.log('🔍 Verificando erro:', { errorMessage, errorCode, fullError: error });
    
    // Verificar código PostgreSQL para duplicate key
    if (errorCode === '23505') {
      console.log('✅ Erro 23505 detectado (duplicate key)');
      return true;
    }
    
    // Verificar mensagem contendo o índice de competição ativa
    if (errorMessage.includes('idx_weekly_config_active') || 
        errorMessage.includes('duplicate key value violates unique constraint')) {
      console.log('✅ Erro de competição ativa detectado na mensagem');
      return true;
    }
    
    return false;
  };

  const handleActivateCompetitions = async () => {
    console.log('🚀 Tentando ativar competições...');
    
    // Verificar se já existe competição ativa antes de tentar ativar
    if (activeConfig) {
      console.log('⚠️ Competição ativa já existe:', activeConfig);
      setActiveCompetitionErrorOpen(true);
      return;
    }

    const result = await activateWeeklyCompetitions();
    
    console.log('📊 Resultado da ativação:', result);
    
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
      console.log('❌ Erro na ativação:', result.error);
      
      // Verificar se é erro de competição ativa duplicada
      if (isActiveCompetitionError(result.error)) {
        console.log('🎯 Detectado erro de competição ativa - abrindo modal');
        setActiveCompetitionErrorOpen(true);
      } else {
        toast({
          title: "Erro",
          description: `Erro ao ativar competições: ${result.error}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleScheduleNew = async () => {
    try {
      setIsLoading(true);
      console.log('📅 Tentando agendar nova competição...');

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
        console.log('❌ Erro ao agendar:', result.error);
        
        // Verificar se é erro de competição ativa duplicada
        if (isActiveCompetitionError(result.error)) {
          console.log('🎯 Detectado erro de competição ativa no agendamento');
          setActiveCompetitionErrorOpen(true);
        } else {
          throw new Error(result.error);
        }
      }

    } catch (error: any) {
      console.error('💥 Erro ao agendar nova competição:', error);
      
      // Verificar se é erro de competição ativa duplicada
      if (isActiveCompetitionError(error)) {
        console.log('🎯 Detectado erro de competição ativa na exception');
        setActiveCompetitionErrorOpen(true);
      } else {
        toast({
          title: "Erro",
          description: `Erro ao agendar competição: ${error.message}`,
          variant: "destructive",
        });
      }
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

  const handleEdit = (competition: WeeklyConfig) => {
    setSelectedCompetition(competition);
    setEditModalOpen(true);
  };

  const handleDelete = (competition: WeeklyConfig) => {
    setSelectedCompetition(competition);
    setDeleteModalOpen(true);
  };

  const handleDeleteCompleted = (competition: any) => {
    setSelectedCompetition(competition);
    setDeleteCompletedModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadConfigurations();
    refetchHistory();
    onConfigUpdated();
  };

  return {
    // State
    isLoading,
    newStartDate,
    newEndDate,
    editModalOpen,
    deleteModalOpen,
    deleteCompletedModalOpen,
    activeCompetitionErrorOpen,
    selectedCompetition,
    historyPage,
    
    // Data
    activeConfig,
    scheduledConfigs,
    lastCompletedConfig,
    configsLoading,
    weeklyHistoryData,
    historyLoading,
    historyTotalPages,
    isActivating,
    
    // Setters
    setNewStartDate,
    setNewEndDate,
    setEditModalOpen,
    setDeleteModalOpen,
    setDeleteCompletedModalOpen,
    setActiveCompetitionErrorOpen,
    setHistoryPage,
    
    // Handlers
    initializeDates,
    handleActivateCompetitions,
    handleScheduleNew,
    handleFinalize,
    handleEdit,
    handleDelete,
    handleDeleteCompleted,
    handleModalSuccess
  };
};
