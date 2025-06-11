
import { useEffect } from 'react';
import { CompetitionStatusService } from '@/services/competitionStatusService';

export const useCompetitionStatusUpdater = (competitions: any[]) => {
  useEffect(() => {
    const updateCompetitionStatuses = async () => {
      try {
        console.log('🔄 Verificando status das competições...');
        
        // Atualizar status de todas as competições
        await CompetitionStatusService.updateAllCompetitionsStatus();
        
        console.log('✅ Status das competições atualizados');
      } catch (error) {
        console.error('❌ Erro ao atualizar status das competições:', error);
      }
    };

    // Verificar status imediatamente quando o componente monta
    updateCompetitionStatuses();

    // Verificar status a cada 5 minutos
    const interval = setInterval(updateCompetitionStatuses, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [competitions]);
};
