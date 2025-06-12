
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { validateDailyCompetitionData, isDailyCompetitionTimeValid } from '@/utils/dailyCompetitionValidation';

export const useDailyCompetitionValidation = () => {
  const { toast } = useToast();

  const validateAndPrepareData = useCallback((formData: any) => {
    try {
      console.log('🔍 Hook: Validação diária SIMPLIFICADA:', formData);
      
      // Aplicar validação simplificada (sem conversões de timezone)
      const validatedData = validateDailyCompetitionData(formData);
      
      console.log('✅ Hook: Dados validados (SISTEMA SIMPLIFICADO):', validatedData);
      
      // Informar ao usuário sobre o sistema simplificado
      toast({
        title: "Sistema Simplificado Ativo",
        description: "Horários automáticos: 00:00:00 às 23:59:59 (Brasília). O banco ajusta o timezone.",
        duration: 3000,
      });
      
      return validatedData;
    } catch (error) {
      console.error('❌ Hook: Erro na validação simplificada:', error);
      
      toast({
        title: "Erro na Validação",
        description: error instanceof Error ? error.message : "Dados inválidos para competição diária",
        variant: "destructive",
      });
      
      throw error;
    }
  }, [toast]);

  const checkExistingDailyCompetition = useCallback((competition: any) => {
    if (competition?.competition_type === 'challenge') {
      const isValid = isDailyCompetitionTimeValid(competition.start_date, competition.end_date);
      
      if (!isValid) {
        console.warn('⚠️ Competição diária com horário inconsistente:', competition.id);
        
        toast({
          title: "Sistema Simplificado Detectou Inconsistência",
          description: "Esta competição será automaticamente corrigida pelo novo sistema.",
          variant: "destructive",
        });
      }
      
      return isValid;
    }
    
    return true;
  }, [toast]);

  return {
    validateAndPrepareData,
    checkExistingDailyCompetition
  };
};
