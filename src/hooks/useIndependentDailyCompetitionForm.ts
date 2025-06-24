
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { independentCompetitionService } from '@/services/independentCompetitionService';
import { secureLogger } from '@/utils/secureLogger';

interface IndependentCompetitionFormData {
  title: string;
  description: string;
  theme: string;
  startDate: string;
  maxParticipants: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const useIndependentDailyCompetitionForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<IndependentCompetitionFormData>({
    title: '',
    description: '',
    theme: 'geral',
    startDate: '',
    maxParticipants: 1000
  });

  const updateField = useCallback((field: keyof IndependentCompetitionFormData, value: any) => {
    secureLogger.debug(`Campo alterado: ${field}`, { value }, 'INDEPENDENT_COMPETITION_FORM');
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback((): ValidationResult => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Título é obrigatório');
    }

    if (!formData.theme) {
      errors.push('Tema é obrigatório');
    }

    if (!formData.startDate) {
      errors.push('Data de início é obrigatória');
    }

    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const now = new Date();
      if (startDate < now) {
        errors.push('Data de início deve ser futura');
      }
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
    secureLogger.info('Criando competição independente', { 
      title: formData.title, 
      theme: formData.theme 
    }, 'INDEPENDENT_COMPETITION_FORM');

    try {
      const result = await independentCompetitionService.createIndependentCompetition(formData);
      
      if (result.success) {
        secureLogger.info('Competição independente criada', { 
          id: result.data?.id 
        }, 'INDEPENDENT_COMPETITION_FORM');
        
        toast({
          title: "✅ Sucesso!",
          description: "Competição diária independente criada com sucesso.",
        });
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          theme: 'geral',
          startDate: '',
          maxParticipants: 1000
        });
        
        if (onSuccess) onSuccess();
      } else {
        throw new Error(result.error || 'Erro ao criar competição');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar competição";
      secureLogger.error('Erro na criação da competição independente', { error: errorMessage }, 'INDEPENDENT_COMPETITION_FORM');
      
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
      theme: 'geral',
      startDate: '',
      maxParticipants: 1000
    });
  }, []);

  return {
    formData,
    updateField,
    validateForm,
    submitForm,
    resetForm,
    isSubmitting
  };
};
