
import { useEffect } from 'react';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
import { supabase } from '@/integrations/supabase/client';
import { getBrasiliaTime, formatBrasiliaTime } from '@/utils/brasiliaTime';

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
          .select('id, title, end_date')
          .eq('competition_type', 'challenge')
          .eq('status', 'active')
          .lt('end_date', now);

        if (error) {
          console.error('❌ Erro ao buscar competições expiradas:', error);
          return;
        }

        if (expiredCompetitions && expiredCompetitions.length > 0) {
          console.log(`📋 Encontradas ${expiredCompetitions.length} competições expiradas`);
          
          // Finalizar cada competição expirada
          for (const competition of expiredCompetitions) {
            console.log(`🏁 Finalizando competição: ${competition.title} (fim: ${formatBrasiliaTime(new Date(competition.end_date))})`);
            await dailyCompetitionService.finalizeDailyCompetition(competition.id);
          }
        } else {
          console.log('✅ Nenhuma competição expirada encontrada');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar competições expiradas:', error);
      }
    };

    // Verificar imediatamente
    checkExpiredCompetitions();

    // Verificar a cada 5 minutos
    const interval = setInterval(checkExpiredCompetitions, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
