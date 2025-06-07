
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ChallengeFormData, getDefaultFormData } from './ChallengeFormData';

export const useChallengeActions = (challenges: any[], refetch: () => void) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [formData, setFormData] = useState<ChallengeFormData>(getDefaultFormData());
  const { toast } = useToast();

  const resetForm = () => {
    setFormData(getDefaultFormData());
  };

  const getNextId = () => {
    if (challenges.length === 0) return 1;
    return Math.max(...challenges.map(c => c.id)) + 1;
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format
  };

  const handleCreate = async () => {
    try {
      const nextId = getNextId();
      const challengeData = {
        id: nextId,
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      const { error } = await supabase
        .from('challenges')
        .insert(challengeData);

      if (error) throw error;

      toast({
        title: "Desafio criado",
        description: `${formData.title} foi criado com sucesso.`,
      });

      resetForm();
      setIsCreating(false);
      refetch();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar desafio.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingChallenge) return;

    try {
      const updateData = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      const { error } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', editingChallenge.id);

      if (error) throw error;

      toast({
        title: "Desafio atualizado",
        description: `${formData.title} foi atualizado com sucesso.`,
      });

      resetForm();
      setEditingChallenge(null);
      refetch();
    } catch (error) {
      console.error('Error updating challenge:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar desafio.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (challenge: any) => {
    console.log('🔧 Carregando dados para edição:', challenge);
    
    setFormData({
      title: challenge.title,
      description: challenge.description || '',
      theme: challenge.theme,
      color: challenge.color,
      difficulty: challenge.difficulty,
      levels: challenge.levels,
      is_active: challenge.is_active,
      start_date: formatDateForInput(challenge.start_date),
      end_date: formatDateForInput(challenge.end_date)
    });
    
    setEditingChallenge(challenge);
    
    console.log('🔧 FormData configurado:', {
      start_date: formatDateForInput(challenge.start_date),
      end_date: formatDateForInput(challenge.end_date)
    });
  };

  const handleDelete = async (challengeId: number) => {
    if (!confirm('Tem certeza que deseja excluir este desafio?')) return;

    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: "Desafio excluído",
        description: "Desafio foi excluído com sucesso.",
        variant: "destructive",
      });

      refetch();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir desafio.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsCreating(false);
    setEditingChallenge(null);
  };

  const updateFormData = (updates: Partial<ChallengeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    isCreating,
    setIsCreating,
    editingChallenge,
    formData,
    handleCreate,
    handleUpdate,
    handleEdit,
    handleDelete,
    handleCancel,
    updateFormData
  };
};
