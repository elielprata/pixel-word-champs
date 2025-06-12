
import { useEffect } from 'react';
import { competitionStatusService } from '@/services/competitionStatusService';

export const useCompetitionStatusUpdater = (competitions: any[]) => {
  useEffect(() => {
    const updateCompetitionStatuses = async () => {
      try {
        console.log('🔄 Verificando status das competições...');
        
        // Atualizar status de competições específicas se necessário
        for (const competition of competitions) {
          await competitionStatusService.updateSingleCompetitionStatus(competition.id, competition.status);
        }
        
        console.log('✅ Status das competições atualizados');
      } catch (error) {
        console.error('❌ Erro ao atualizar status das competições:', error);
      }
    };

    // Verificar status imediatamente quando o componente monta ou a lista muda
    if (competitions.length > 0) {
      updateCompetitionStatuses();
    }

    // Verificar status a cada 2 minutos para atualizações em tempo real
    const interval = setInterval(updateCompetitionStatuses, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [competitions]);
};
