
import { useEffect } from 'react';
import { CompetitionStatusService } from '@/services/competitionStatusService';

export const useCompetitionStatusUpdater = (competitions: any[]) => {
  useEffect(() => {
    const updateCompetitionStatuses = async () => {
      try {
        console.log('🔄 Verificando status das competições...');
        
        // Atualizar status de competições específicas se necessário
        for (const competition of competitions) {
          // Para competições diárias, ser mais conservador na atualização
          if (competition.competition_type === 'challenge') {
            const now = new Date();
            const endDate = new Date(competition.end_date);
            const timeDiff = now.getTime() - endDate.getTime();
            
            // Só atualizar competições diárias que passaram mais de 10 minutos do fim
            if (timeDiff > 10 * 60 * 1000) {
              await CompetitionStatusService.updateSingleCompetitionStatus(competition.id);
            } else {
              console.log(`ℹ️ Competição diária ${competition.id} dentro da margem de tolerância, não atualizando`);
            }
          } else {
            // Para competições semanais, usar lógica normal
            await CompetitionStatusService.updateSingleCompetitionStatus(competition.id);
          }
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

    // Verificar status a cada 5 minutos para competições diárias (menos frequente)
    const interval = setInterval(updateCompetitionStatuses, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [competitions]);
};
