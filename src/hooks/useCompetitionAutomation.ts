
import { useEffect } from 'react';
import { customCompetitionService } from '@/services/customCompetitionService';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
import { useToast } from '@/hooks/use-toast';

export const useCompetitionAutomation = () => {
  const { toast } = useToast();

  useEffect(() => {
    const runAutomation = async () => {
      try {
        console.log('🤖 Executando automação de competições...');
        
        // Auto-ativação de competições agendadas
        await autoActivateScheduledCompetitions();
        
        // Auto-finalização de competições expiradas
        await autoFinalizeExpiredCompetitions();
        
      } catch (error) {
        console.error('❌ Erro na automação:', error);
      }
    };

    const autoActivateScheduledCompetitions = async () => {
      try {
        const response = await customCompetitionService.getCustomCompetitions();
        if (!response.success) return;

        const now = new Date();
        const scheduledCompetitions = response.data.filter(comp => 
          comp.status === 'scheduled' && 
          new Date(comp.start_date) <= now &&
          new Date(comp.end_date) > now
        );

        for (const competition of scheduledCompetitions) {
          console.log(`🟢 Auto-ativando competição: ${competition.title}`);
          await customCompetitionService.updateCompetition(competition.id, {
            ...competition,
            status: 'active'
          });
          
          toast({
            title: "Competição Ativada",
            description: `${competition.title} foi ativada automaticamente.`,
          });
        }
      } catch (error) {
        console.error('❌ Erro ao auto-ativar competições:', error);
      }
    };

    const autoFinalizeExpiredCompetitions = async () => {
      try {
        const response = await customCompetitionService.getCustomCompetitions();
        if (!response.success) return;

        const now = new Date();
        const expiredCompetitions = response.data.filter(comp => 
          comp.status === 'active' && 
          new Date(comp.end_date) < now
        );

        for (const competition of expiredCompetitions) {
          console.log(`🏁 Auto-finalizando competição: ${competition.title}`);
          
          if (competition.competition_type === 'challenge') {
            // Finalizar competição diária com transferência de pontos
            await dailyCompetitionService.finalizeDailyCompetition(competition.id);
          } else {
            // Finalizar competição semanal
            await customCompetitionService.updateCompetition(competition.id, {
              ...competition,
              status: 'completed'
            });
          }
          
          toast({
            title: "Competição Finalizada",
            description: `${competition.title} foi finalizada automaticamente.`,
          });
        }
      } catch (error) {
        console.error('❌ Erro ao auto-finalizar competições:', error);
      }
    };

    // Executar imediatamente
    runAutomation();

    // Executar a cada 2 minutos
    const interval = setInterval(runAutomation, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [toast]);
};
