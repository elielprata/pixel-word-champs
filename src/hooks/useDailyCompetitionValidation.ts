
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { validateDailyCompetitionData, isDailyCompetitionTimeValid } from '@/utils/dailyCompetitionValidation';

export const useDailyCompetitionValidation = () => {
  const { toast } = useToast();

  const validateAndPrepareData = useCallback((formData: any) => {
    try {
      console.log('🔍 Hook: Validação diária SIMPLIFICADA:', formData);
      
      // IMPORTANTE: Garantir que competições diárias não tenham prêmios
      const dataWithNoPrizes = {
        ...formData,
        prize_pool: 0 // Forçar prize_pool = 0 para competições diárias
      };
      
      // Aplicar validação simplificada (sem conversões de timezone)
      const validatedData = validateDailyCompetitionData(dataWithNoPrizes);
      
      console.log('✅ Hook: Dados validados (SISTEMA SIMPLIFICADO):', validatedData);
      
      // Informar ao usuário sobre o sistema simplificado
      toast({
        title: "Sistema Simplificado Ativo",
        description: "Competições diárias não possuem premiação. Horários: 00:00:00 às 23:59:59 (Brasília).",
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
      
      // Verificar se tem prêmios (não deveria ter)
      if (competition.prize_pool && competition.prize_pool > 0) {
        console.warn('⚠️ Competição diária com prêmios detectada - será corrigida:', competition.id);
        
        toast({
          title: "Prêmios Removidos",
          description: "Competições diárias não podem ter prêmios. Os prêmios foram automaticamente removidos.",
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
