
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { CompetitionFormData, CompetitionValidationResult } from '@/types/competition';
import { unifiedCompetitionService } from '@/services/unifiedCompetitionService';
import { secureLogger } from '@/utils/secureLogger';

const getCurrentBrasiliaTimeSafe = (): string => {
  try {
    const now = new Date();
    return now.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/,\s*/g, ' ').trim();
  } catch (error) {
    console.error('❌ Erro ao obter horário seguro:', error);
    return new Date().toLocaleString('pt-BR');
  }
};

const validateCompetitionDurationSafe = (startDate: string, duration: number) => {
  try {
    if (!startDate || !duration || duration < 1) {
      return { isValid: false, error: 'Data de início e duração são obrigatórias' };
    }
    
    if (duration > 12) {
      return { isValid: false, error: 'Duração máxima é de 12 horas' };
    }

    return { isValid: true, error: null };
  } catch (error) {
    console.error('❌ Erro na validação segura:', error);
    return { isValid: false, error: 'Erro na validação' };
  }
};

export const useUnifiedCompetitionForm = () => {
  console.log('🚀 [useUnifiedCompetitionForm] INICIANDO HOOK');
  
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

  console.log('✅ [useUnifiedCompetitionForm] Estado inicial criado');

  const updateField = useCallback((field: keyof CompetitionFormData, value: any) => {
    console.log('📝 [useUnifiedCompetitionForm] Campo alterado:', {
      field,
      value,
      timestamp: getCurrentBrasiliaTimeSafe()
    });
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Recalcular endDate quando startDate ou duration mudarem
      if (field === 'startDate' || field === 'duration') {
        if (newData.startDate && newData.duration) {
          try {
            console.log('⏰ [useUnifiedCompetitionForm] Recalculando endDate:', {
              startDate: newData.startDate,
              duration: newData.duration
            });
            
            const brasiliaStart = new Date(newData.startDate);
            const brasiliaEnd = new Date(brasiliaStart.getTime() + (newData.duration * 60 * 60 * 1000));
            
            const sameDayLimit = new Date(brasiliaStart);
            sameDayLimit.setHours(23, 59, 59, 999);
            
            const finalBrasiliaEnd = brasiliaEnd > sameDayLimit ? sameDayLimit : brasiliaEnd;
            
            const year = finalBrasiliaEnd.getFullYear();
            const month = (finalBrasiliaEnd.getMonth() + 1).toString().padStart(2, '0');
            const day = finalBrasiliaEnd.getDate().toString().padStart(2, '0');
            const hours = finalBrasiliaEnd.getHours().toString().padStart(2, '0');
            const minutes = finalBrasiliaEnd.getMinutes().toString().padStart(2, '0');
            
            newData.endDate = `${year}-${month}-${day}T${hours}:${minutes}`;
            
            console.log('✅ [useUnifiedCompetitionForm] EndDate calculado:', {
              endDate: newData.endDate
            });
          } catch (error) {
            console.error('❌ [useUnifiedCompetitionForm] Erro ao calcular endDate:', error);
          }
        }
      }
      
      return newData;
    });
  }, []);

  const validateForm = useCallback((): CompetitionValidationResult => {
    console.log('🔍 [useUnifiedCompetitionForm] Validando formulário');
    
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
      const durationValidation = validateCompetitionDurationSafe(formData.startDate, formData.duration);
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

    console.log('🚀 [useUnifiedCompetitionForm] Iniciando submissão:', {
      formData,
      timestamp: getCurrentBrasiliaTimeSafe()
    });

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
    console.log('🔄 [useUnifiedCompetitionForm] Resetando formulário');
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

  console.log('✅ [useUnifiedCompetitionForm] Hook pronto para uso');

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
