
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createBrasiliaStartOfDay, createBrasiliaEndOfDay, formatBrasiliaTime } from '@/utils/brasiliaTime';

interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  status: string;
  created_at: string;
}

interface NewCompetition {
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  max_participants: number;
}

export const useDailyCompetitionForm = (onSuccess: () => void) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<DailyCompetition | null>(null);
  const [newCompetition, setNewCompetition] = useState<NewCompetition>({
    title: '',
    description: '',
    theme: '',
    start_date: '',
    end_date: '',
    max_participants: 0
  });
  const { toast } = useToast();

  const ensureEndOfDay = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const endOfDay = createBrasiliaEndOfDay(date);
    
    console.log('📅 Ajustando fim do dia (Brasília - 23:59:59.999):', formatBrasiliaTime(endOfDay));
    
    return endOfDay.toISOString();
  };

  const ensureStartOfDay = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const startOfDay = createBrasiliaStartOfDay(date);
    
    console.log('📅 Ajustando início do dia (Brasília - 00:00:00.000):', formatBrasiliaTime(startOfDay));
    
    return startOfDay.toISOString();
  };

  // CORRIGIDO: Função que só altera datas quando REALMENTE necessário
  const handleStartDateChange = (value: string) => {
    console.log('📅 handleStartDateChange chamado com:', value);
    
    // Se não há valor, não fazer nada
    if (!value) return;
    
    const adjustedStartDate = ensureStartOfDay(value);
    const adjustedEndDate = ensureEndOfDay(value);
    
    console.log('📅 Datas ajustadas:', {
      start: formatBrasiliaTime(new Date(adjustedStartDate)),
      end: formatBrasiliaTime(new Date(adjustedEndDate))
    });
    
    if (editingCompetition) {
      setEditingCompetition({
        ...editingCompetition, 
        start_date: adjustedStartDate,
        end_date: adjustedEndDate
      });
    } else {
      setNewCompetition({
        ...newCompetition, 
        start_date: adjustedStartDate,
        end_date: adjustedEndDate
      });
    }
  };

  const addCompetition = async () => {
    try {
      const adjustedCompetition = {
        ...newCompetition,
        start_date: ensureStartOfDay(newCompetition.start_date),
        end_date: ensureEndOfDay(newCompetition.start_date),
        competition_type: 'challenge',
        status: 'scheduled',
        max_participants: 0
      };

      console.log('🎯 Criando competição diária com padrão corrigido:', {
        start: formatBrasiliaTime(new Date(adjustedCompetition.start_date)),
        end: formatBrasiliaTime(new Date(adjustedCompetition.end_date)),
        max_participants: 'ILIMITADO'
      });

      const { error } = await supabase
        .from('custom_competitions')
        .insert([adjustedCompetition]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Competição diária criada com sucesso"
      });

      setNewCompetition({
        title: '',
        description: '',
        theme: '',
        start_date: '',
        end_date: '',
        max_participants: 0
      });
      setIsAddModalOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar competição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a competição diária",
        variant: "destructive"
      });
    }
  };

  // CORRIGIDO: Função de atualização que preserva datas originais se não foram alteradas
  const updateCompetition = async () => {
    if (!editingCompetition) return;

    try {
      // IMPORTANTE: Usar as datas originais da competição em edição
      // Não recalcular automaticamente a menos que o usuário tenha alterado a data
      const updateData = {
        title: editingCompetition.title,
        description: editingCompetition.description,
        theme: editingCompetition.theme,
        // PRESERVAR as datas originais - não recalcular automaticamente
        start_date: editingCompetition.start_date,
        end_date: editingCompetition.end_date,
        max_participants: 0,
        // Manter o status existente se as datas não mudaram
        status: editingCompetition.status
      };

      console.log('🔧 Atualizando competição diária PRESERVANDO datas originais:', {
        start: formatBrasiliaTime(new Date(updateData.start_date)),
        end: formatBrasiliaTime(new Date(updateData.end_date)),
        status: updateData.status,
        title: updateData.title,
        description: updateData.description
      });

      const { error } = await supabase
        .from('custom_competitions')
        .update(updateData)
        .eq('id', editingCompetition.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Competição diária atualizada com sucesso"
      });

      setEditingCompetition(null);
      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar competição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a competição diária",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (competition: DailyCompetition) => {
    console.log('📝 Iniciando edição da competição:', {
      id: competition.id,
      title: competition.title,
      originalStartDate: formatBrasiliaTime(new Date(competition.start_date)),
      originalEndDate: formatBrasiliaTime(new Date(competition.end_date)),
      originalStatus: competition.status
    });
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
    handleEdit
  };
};
