
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { CompetitionFormData, CompetitionValidationResult } from '@/types/competition';
import { unifiedCompetitionService } from '@/services/unifiedCompetitionService';
import { secureLogger } from '@/utils/secureLogger';
import { validateCompetitionDuration } from '@/utils/brasiliaTimeUnified';

export const useUnifiedCompetitionForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompetitionFormData>({
    title: '',
    description: '',
    type: 'daily',
    startDate: '',
    endDate: '',
    duration: 3,
    maxParticipants: 0
  });

  const updateField = useCallback((field: keyof CompetitionFormData, value: any) => {
    secureLogger.debug(`Campo alterado: ${field}`, { value }, 'UNIFIED_COMPETITION_FORM');
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // CORRIGIDO: Recalcular endDate mantendo tudo em Brasília
      if (field === 'startDate' || field === 'duration') {
        if (newData.startDate && newData.duration) {
          try {
            console.log('🔄 Recalculando endDate (Brasília):', {
              startDate: newData.startDate,
              duration: newData.duration
            });
            
            // Calcular fim em horário de Brasília
            const brasiliaStart = new Date(newData.startDate);
            const brasiliaEnd = new Date(brasiliaStart.getTime() + (newData.duration * 60 * 60 * 1000));
            
            // Verificar limite do mesmo dia
            const sameDayLimit = new Date(brasiliaStart);
            sameDayLimit.setHours(23, 59, 59, 999);
            
            const finalBrasiliaEnd = brasiliaEnd > sameDayLimit ? sameDayLimit : brasiliaEnd;
            
            // Converter para formato datetime-local (sem conversão de timezone)
            const year = finalBrasiliaEnd.getFullYear();
            const month = (finalBrasiliaEnd.getMonth() + 1).toString().padStart(2, '0');
            const day = finalBrasiliaEnd.getDate().toString().padStart(2, '0');
            const hours = finalBrasiliaEnd.getHours().toString().padStart(2, '0');
            const minutes = finalBrasiliaEnd.getMinutes().toString().padStart(2, '0');
            
            newData.endDate = `${year}-${month}-${day}T${hours}:${minutes}`;
            
            console.log('✅ EndDate calculado (Brasília):', {
              brasiliaEnd: finalBrasiliaEnd.toLocaleString('pt-BR'),
              endDateFormat: newData.endDate
            });
          } catch (error) {
            console.error('❌ Erro ao calcular endDate:', error);
          }
        }
      }
      
      return newData;
    });
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

    if (!formData.duration || formData.duration < 1) {
      errors.push('Duração deve ser de pelo menos 1 hora');
    }

    // Validar duração específica
    if (formData.startDate && formData.duration) {
      const durationValidation = validateCompetitionDuration(formData.startDate, formData.duration);
      if (!durationValidation.isValid && durationValidation.error) {
        errors.push(durationValidation.error);
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
    secureLogger.info('Iniciando submissão de competição', { 
      title: formData.title, 
      type: formData.type,
      duration: formData.duration
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
          duration: 3,
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
      duration: 3,
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
