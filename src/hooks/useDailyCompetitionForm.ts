import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { dailyCompetitionValidationService } from '@/services/dailyCompetition/dailyCompetitionValidationService';
import { useDailyCompetitionValidation } from '@/hooks/useDailyCompetitionValidation';
import { DailyCompetition } from '@/types/dailyCompetition';

export const useDailyCompetitionForm = (onSuccess?: () => void) => {
  const { toast } = useToast();
  const { validateAndPrepareData } = useDailyCompetitionValidation();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<DailyCompetition | null>(null);
  const [newCompetition, setNewCompetition] = useState({
    title: '',
    description: '',
    theme: '',
    start_date: '',
    max_participants: 1000
  });

  const resetForm = () => {
    setNewCompetition({
      title: '',
      description: '',
      theme: '',
      start_date: '',
      max_participants: 1000
    });
  };

  const handleStartDateChange = (date: string) => {
    console.log('📅 Hook: Data alterada:', date);
    // A validação de horário será feita automaticamente no submit
  };

  const addCompetition = async (formData: any) => {
    try {
      console.log('➕ Hook: Criando nova competição com validação automática');
      
      const response = await dailyCompetitionValidationService.createDailyCompetition(formData);
      
      if (response.success) {
        toast({
          title: "Competição Diária Criada",
          description: "A competição foi criada com horário de término às 23:59:59 automaticamente.",
        });
        
        resetForm();
        if (onSuccess) onSuccess();
      } else {
        throw new Error(response.error || 'Erro ao criar competição');
      }
    } catch (error) {
      console.error('❌ Hook: Erro ao criar:', error);
      toast({
        title: "Erro ao criar competição",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const updateCompetition = async (formData: any) => {
    if (!editingCompetition) return;
    
    try {
      console.log('✏️ Hook: Atualizando competição com validação automática');
      
      const response = await dailyCompetitionValidationService.updateDailyCompetition(
        editingCompetition.id, 
        formData
      );
      
      if (response.success) {
        toast({
          title: "Competição Atualizada",
          description: "A competição foi atualizada com horário de término às 23:59:59 automaticamente.",
        });
        
        setEditingCompetition(null);
        if (onSuccess) onSuccess();
      } else {
        throw new Error(response.error || 'Erro ao atualizar competição');
      }
    } catch (error) {
      console.error('❌ Hook: Erro ao atualizar:', error);
      toast({
        title: "Erro ao atualizar competição",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (competition: DailyCompetition) => {
    console.log('✏️ Hook: Iniciando edição de competição:', competition.id);
    setEditingCompetition(competition);
  };

  return {
    isAddModalOpen,
    setIsAddModalOpen,
    editingCompetition,
    setEditingCompetition,
    newCompetition,
    setNewCompetition,
    handleStartDateChange,
    addCompetition,
    updateCompetition,
    handleEdit,
    resetForm
  };
};
