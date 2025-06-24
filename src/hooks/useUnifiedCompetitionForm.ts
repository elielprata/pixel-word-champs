
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { CompetitionFormData, CompetitionValidationResult } from '@/types/competition';
import { unifiedCompetitionService } from '@/services/unifiedCompetitionService';
import { secureLogger } from '@/utils/secureLogger';

export const useUnifiedCompetitionForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompetitionFormData>({
    title: '',
    description: '',
    type: 'daily', // Apenas competições diárias
    startDate: '',
    endDate: '',
    maxParticipants: 0 // Não usado mais - participação livre
  });

  const updateField = useCallback((field: keyof CompetitionFormData, value: any) => {
    secureLogger.debug(`Campo alterado: ${field}`, { value }, 'UNIFIED_COMPETITION_FORM');
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback((): CompetitionValidationResult => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Título é obrigatório');
    }

    if (!formData.description.trim()) {
      errors.push('Descrição é obrigatória');
    }

    if (!formData.startDate) {
      errors.push('Data de início é obrigatória');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [formData]);

  const submitForm = useCallback(async (onSuccess?: () => void) => {
    if (isSubmitting) return;

    const validation = validateForm();
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        toast({
          title: "Erro de Validação",
          description: error,
          variant: "destructive",
        });
      });
      return;
    }

    setIsSubmitting(true);
    secureLogger.info('Iniciando submissão de competição', { 
      title: formData.title, 
      type: formData.type
    }, 'UNIFIED_COMPETITION_FORM');

    try {
      const result = await unifiedCompetitionService.createCompetition(formData);
      
      if (result.success) {
        secureLogger.info('Competição criada com sucesso', { 
          id: result.data?.id 
        }, 'UNIFIED_COMPETITION_FORM');
        
        toast({
          title: "Sucesso!",
          description: "Competição diária criada com sucesso.",
        });
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          type: 'daily',
          startDate: '',
          endDate: '',
          maxParticipants: 0
        });
        
        if (onSuccess) onSuccess();
      } else {
        throw new Error(result.error || 'Erro ao criar competição');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar competição";
      secureLogger.error('Erro na submissão', { error: errorMessage }, 'UNIFIED_COMPETITION_FORM');
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, validateForm, toast]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      type: 'daily',
      startDate: '',
      endDate: '',
      maxParticipants: 0
    });
  }, []);

  return {
    formData,
    updateField,
    validateForm,
    submitForm,
    resetForm,
    isSubmitting,
    hasTitle: !!formData.title.trim()
  };
};
