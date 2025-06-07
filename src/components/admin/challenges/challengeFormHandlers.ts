
import { ChallengeFormData, getDefaultFormData } from './ChallengeFormData';
import { formatDateForInput } from './challengeUtils';
import { createChallenge, updateChallenge, deleteChallenge } from './challengeApiOperations';

export const createFormHandlers = (
  formData: ChallengeFormData,
  setFormData: (data: ChallengeFormData) => void,
  setIsCreating: (value: boolean) => void,
  setEditingChallenge: (challenge: any) => void,
  challenges: any[],
  refetch: () => void,
  toast: any
) => {
  const resetForm = () => {
    setFormData(getDefaultFormData());
  };

  const handleCreate = async () => {
    try {
      await createChallenge(formData, challenges);

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

  const handleUpdate = async (editingChallenge: any) => {
    if (!editingChallenge) return;

    try {
      await updateChallenge(formData, editingChallenge.id);

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
  };

  const handleDelete = async (challengeId: number) => {
    if (!confirm('Tem certeza que deseja excluir este desafio?')) return;

    try {
      await deleteChallenge(challengeId);

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
    handleCreate,
    handleUpdate,
    handleEdit,
    handleDelete,
    handleCancel,
    updateFormData
  };
};
