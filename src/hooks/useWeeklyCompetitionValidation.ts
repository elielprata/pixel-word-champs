
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { validateWeeklyCompetitionData, isWeeklyCompetitionTimeValid } from '@/utils/weeklyCompetitionValidation';

export const useWeeklyCompetitionValidation = () => {
  const { toast } = useToast();

  const validateAndPrepareData = useCallback((formData: any) => {
    try {
      console.log('🔍 Hook: Validando dados da competição semanal:', formData);
      
      // Aplicar validação e correção automática
      const validatedData = validateWeeklyCompetitionData(formData);
      
      console.log('✅ Hook: Dados validados e corrigidos:', validatedData);
      
      // Informar ao usuário sobre a correção automática
      toast({
        title: "Horários Ajustados Automaticamente",
        description: "Competições semanais sempre começam às 00:00:00 e terminam às 23:59:59.",
        duration: 3000,
      });
      
      return validatedData;
    } catch (error) {
      console.error('❌ Hook: Erro na validação semanal:', error);
      
      toast({
        title: "Erro na Validação",
        description: error instanceof Error ? error.message : "Dados inválidos para competição semanal",
        variant: "destructive",
      });
      
      throw error;
    }
  }, [toast]);

  const checkExistingWeeklyCompetition = useCallback((competition: any) => {
    if (competition?.competition_type === 'tournament') {
      const isValid = isWeeklyCompetitionTimeValid(competition.start_date, competition.end_date);
      
      if (!isValid) {
        console.warn('⚠️ Competição semanal com horário incorreto detectada:', competition.id);
        
        toast({
          title: "Horário Inconsistente Detectado",
          description: "Esta competição será automaticamente corrigida para começar às 00:00:00 e terminar às 23:59:59.",
          variant: "destructive",
        });
      }
      
      return isValid;
    }
    
    return true;
  }, [toast]);

  return {
    validateAndPrepareData,
    checkExistingWeeklyCompetition
  };
};
