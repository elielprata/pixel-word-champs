
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { CompetitionFormData, CompetitionValidationResult } from '@/types/competition';
import { unifiedCompetitionService } from '@/services/unifiedCompetitionService';
import { usePaymentData } from '@/hooks/usePaymentData';
import { secureLogger } from '@/utils/secureLogger';

export const useUnifiedCompetitionForm = () => {
  const { toast } = useToast();
  const paymentData = usePaymentData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompetitionFormData>({
    title: '',
    description: '',
    type: 'weekly',
    startDate: '',
    endDate: '',
    maxParticipants: 1000,
    weeklyTournamentId: ''
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

    if (formData.type === 'weekly' && !formData.endDate) {
      errors.push('Data de fim é obrigatória para competições semanais');
    }

    if (formData.type === 'weekly' && formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        errors.push('Data de fim deve ser posterior à data de início');
      }
    }

    // CORREÇÃO: Validar weekly_tournament_id para competições diárias
    if (formData.type === 'daily' && !formData.weeklyTournamentId?.trim()) {
      errors.push('Torneio semanal é obrigatório para competições diárias');
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
      weeklyTournamentId: formData.weeklyTournamentId
    }, 'UNIFIED_COMPETITION_FORM');

    try {
      // CORREÇÃO: Preparar dados limpos para envio
      const cleanFormData = {
        ...formData,
        // Garantir que weeklyTournamentId seja enviado corretamente
        weeklyTournamentId: formData.type === 'daily' && formData.weeklyTournamentId?.trim() 
          ? formData.weeklyTournamentId.trim()
          : formData.type === 'weekly' 
            ? undefined 
            : formData.weeklyTournamentId || undefined
      };

      secureLogger.debug('Dados limpos para envio', { cleanFormData }, 'UNIFIED_COMPETITION_FORM');

      // Calcular prêmio total para competições semanais
      if (formData.type === 'weekly') {
        const totalPrize = paymentData.calculateTotalPrize();
        secureLogger.debug('Prêmio total calculado', { totalPrize }, 'UNIFIED_COMPETITION_FORM');
      }

      const result = await unifiedCompetitionService.createCompetition(cleanFormData);
      
      if (result.success) {
        secureLogger.info('Competição criada com sucesso', { 
          id: result.data?.id 
        }, 'UNIFIED_COMPETITION_FORM');
        
        toast({
          title: "Sucesso!",
          description: "Competição criada com sucesso.",
        });
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          type: 'weekly',
          startDate: '',
          endDate: '',
          maxParticipants: 1000,
          weeklyTournamentId: ''
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
  }, [formData, isSubmitting, validateForm, paymentData, toast]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      type: 'weekly',
      startDate: '',
      endDate: '',
      maxParticipants: 1000,
      weeklyTournamentId: ''
    });
  }, []);

  return {
    formData,
    updateField,
    validateForm,
    submitForm,
    resetForm,
    isSubmitting,
    paymentData,
    hasTitle: !!formData.title.trim()
  };
};
