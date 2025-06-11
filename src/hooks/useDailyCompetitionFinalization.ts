
import { useEffect } from 'react';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
import { supabase } from '@/integrations/supabase/client';

export const useDailyCompetitionFinalization = () => {
  useEffect(() => {
    const checkExpiredCompetitions = async () => {
      try {
        console.log('🔍 Verificando competições diárias expiradas...');
        
        const now = new Date();
        const nowISO = now.toISOString();
        
        console.log('🕐 Horário atual (UTC):', nowISO);
        
        // Buscar competições ativas que já expiraram (com margem de segurança)
        const { data: expiredCompetitions, error } = await supabase
          .from('custom_competitions')
          .select('id, title, end_date')
          .eq('competition_type', 'challenge')
          .eq('status', 'active')
          .lt('end_date', nowISO);

        if (error) {
          console.error('❌ Erro ao buscar competições expiradas:', error);
          return;
        }

        if (expiredCompetitions && expiredCompetitions.length > 0) {
          console.log(`📋 Encontradas ${expiredCompetitions.length} competições realmente expiradas`);
          
          // Finalizar cada competição expirada
          for (const competition of expiredCompetitions) {
            console.log(`🏁 Finalizando competição: ${competition.title} (fim: ${competition.end_date})`);
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

    // Verificar a cada 10 minutos (reduzindo frequência)
    const interval = setInterval(checkExpiredCompetitions, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
