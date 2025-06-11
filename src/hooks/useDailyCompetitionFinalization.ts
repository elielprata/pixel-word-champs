
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
        
        // Adicionar margem de 15 minutos antes de considerar como expirada
        const marginTime = new Date(now.getTime() - (15 * 60 * 1000));
        const marginTimeISO = marginTime.toISOString();
        
        console.log('🕐 Horário atual (UTC):', nowISO);
        console.log('🕐 Margem de tolerância (UTC):', marginTimeISO);
        
        // Buscar competições ativas que realmente expiraram (com margem de segurança)
        const { data: expiredCompetitions, error } = await supabase
          .from('custom_competitions')
          .select('id, title, end_date')
          .eq('competition_type', 'challenge')
          .eq('status', 'active')
          .lt('end_date', marginTimeISO); // Usar margem de tolerância

        if (error) {
          console.error('❌ Erro ao buscar competições expiradas:', error);
          return;
        }

        if (expiredCompetitions && expiredCompetitions.length > 0) {
          console.log(`📋 Encontradas ${expiredCompetitions.length} competições realmente expiradas (com margem de 15 min)`);
          
          // Finalizar cada competição expirada
          for (const competition of expiredCompetitions) {
            console.log(`🏁 Finalizando competição: ${competition.title} (fim: ${competition.end_date})`);
            await dailyCompetitionService.finalizeDailyCompetition(competition.id);
          }
        } else {
          console.log('✅ Nenhuma competição expirada encontrada (considerando margem de tolerância)');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar competições expiradas:', error);
      }
    };

    // Verificar imediatamente
    checkExpiredCompetitions();

    // Verificar a cada 15 minutos (menos frequente para dar mais margem)
    const interval = setInterval(checkExpiredCompetitions, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
