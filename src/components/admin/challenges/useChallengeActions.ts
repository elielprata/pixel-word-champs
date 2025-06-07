
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ChallengeFormData, getDefaultFormData } from './ChallengeFormData';
import { createFormHandlers } from './challengeFormHandlers';

export const useChallengeActions = (challenges: any[], refetch: () => void) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [formData, setFormData] = useState<ChallengeFormData>(getDefaultFormData());
  const { toast } = useToast();

  const {
    handleCreate,
    handleUpdate,
    handleEdit,
    handleDelete,
    handleCancel,
    updateFormData
  } = createFormHandlers(
    formData,
    setFormData,
    setIsCreating,
    setEditingChallenge,
    challenges,
    refetch,
    toast
  );

  const wrappedHandleUpdate = () => handleUpdate(editingChallenge);

  return {
    isCreating,
    setIsCreating,
    editingChallenge,
    formData,
    handleCreate,
    handleUpdate: wrappedHandleUpdate,
    handleEdit,
    handleDelete,
    handleCancel,
    updateFormData
  };
};
