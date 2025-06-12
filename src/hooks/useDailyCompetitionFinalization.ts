
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { competitionStatusService } from '@/services/competitionStatusService';

export const useDailyCompetitionFinalization = () => {
  const { toast } = useToast();

  const finalizeCompetition = useCallback(async (competitionId: string, competitionTitle: string) => {
    try {
      console.log(`🏁 Iniciando finalização da competição diária: ${competitionTitle}`);

      // Usar o método específico de finalização que preserva as datas
      const response = await competitionStatusService.finalizeCompetition(competitionId);

      if (!response.success) {
        throw new Error(response.error || 'Erro desconhecido ao finalizar competição');
      }

      console.log(`✅ Competição "${competitionTitle}" finalizada com sucesso`);
      
      toast({
        title: "Competição Finalizada",
        description: `"${competitionTitle}" foi finalizada com sucesso.`,
        duration: 3000,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      console.error(`❌ Erro ao finalizar competição "${competitionTitle}":`, error);
      
      toast({
        title: "Erro na Finalização",
        description: `Falha ao finalizar "${competitionTitle}": ${errorMessage}`,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  }, [toast]);

  const finalizeMutipleDailyCompetitions = useCallback(async (competitions: Array<{id: string, title: string}>) => {
    try {
      console.log(`🏁 Finalizando ${competitions.length} competições diárias em lote`);

      const results = await Promise.allSettled(
        competitions.map(comp => competitionStatusService.finalizeCompetition(comp.id))
      );

      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;

      const failed = results.length - successful;

      if (failed > 0) {
        console.warn(`⚠️ ${failed} competições falharam na finalização`);
        
        toast({
          title: "Finalização Parcial",
          description: `${successful} competições finalizadas com sucesso, ${failed} falharam.`,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Todas as ${successful} competições foram finalizadas com sucesso`);
        
        toast({
          title: "Finalização Completa",
          description: `Todas as ${successful} competições foram finalizadas com sucesso.`,
          duration: 3000,
        });
      }

      return { successful, failed };
    } catch (error) {
      console.error('❌ Erro no processo de finalização em lote:', error);
      
      toast({
        title: "Erro na Finalização em Lote",
        description: "Falha no processo de finalização de múltiplas competições.",
        variant: "destructive",
      });

      return { successful: 0, failed: competitions.length };
    }
  }, [toast]);

  return {
    finalizeCompetition,
    finalizeMutipleDailyCompetitions
  };
};
