
import { useEffect } from 'react';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
import { supabase } from '@/integrations/supabase/client';
import { getBrasiliaTime, formatBrasiliaTime } from '@/utils/brasiliaTime';
import { CompetitionStatusService } from '@/services/competitionStatusService';

export const useDailyCompetitionFinalization = () => {
  useEffect(() => {
    const checkExpiredCompetitions = async () => {
      try {
        console.log('🔍 Verificando competições diárias expiradas...');
        
        const brasiliaTime = getBrasiliaTime();
        const now = brasiliaTime.toISOString();
        
        console.log('🕐 Horário atual de Brasília:', formatBrasiliaTime(brasiliaTime));
        
        // Buscar competições ativas que já expiraram
        const { data: expiredCompetitions, error } = await supabase
          .from('custom_competitions')
          .select('id, title, end_date, status')
          .eq('competition_type', 'challenge')
          .eq('status', 'active')
          .lt('end_date', now);

        if (error) {
          console.error('❌ Erro ao buscar competições expiradas:', error);
          return;
        }

        if (expiredCompetitions && expiredCompetitions.length > 0) {
          console.log(`📋 Encontradas ${expiredCompetitions.length} competições diárias expiradas`);
          
          // Finalizar cada competição expirada usando o serviço de status
          for (const competition of expiredCompetitions) {
            console.log(`🏁 Finalizando competição: ${competition.title} (fim: ${formatBrasiliaTime(new Date(competition.end_date))})`);
            
            // Usar o serviço de status para atualizar
            await CompetitionStatusService.updateSingleCompetitionStatus(competition.id);
            
            // Também finalizar usando o serviço específico de competições diárias
            await dailyCompetitionService.finalizeDailyCompetition(competition.id);
          }
          
          console.log('✅ Todas as competições expiradas foram finalizadas');
        } else {
          console.log('✅ Nenhuma competição diária expirada encontrada');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar competições expiradas:', error);
      }
    };

    // Verificar imediatamente
    checkExpiredCompetitions();

    // Verificar a cada 1 minuto (mais frequente para atualização rápida)
    const interval = setInterval(checkExpiredCompetitions, 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
