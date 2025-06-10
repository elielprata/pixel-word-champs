
import { useEffect } from 'react';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
import { supabase } from '@/integrations/supabase/client';
import { getBrasiliaTime, convertToBrasiliaTime } from '@/utils/brasiliaTime';

export const useDailyCompetitionFinalization = () => {
  useEffect(() => {
    const checkExpiredCompetitions = async () => {
      try {
        console.log('🔍 Verificando competições diárias expiradas...');
        
        const brasiliaNow = getBrasiliaTime();
        console.log('🕐 Horário atual de Brasília:', brasiliaNow.toISOString());
        
        // Buscar competições ativas
        const { data: competitions, error } = await supabase
          .from('custom_competitions')
          .select('id, title, end_date')
          .eq('competition_type', 'challenge')
          .eq('status', 'active');

        if (error) {
          console.error('❌ Erro ao buscar competições:', error);
          return;
        }

        if (!competitions || competitions.length === 0) {
          console.log('✅ Nenhuma competição ativa encontrada');
          return;
        }

        // Filtrar competições expiradas usando horário de Brasília
        const expiredCompetitions = competitions.filter(comp => {
          const endDate = new Date(comp.end_date);
          const endBrasilia = convertToBrasiliaTime(endDate);
          
          console.log(`🔍 Verificando "${comp.title}":`, {
            endUTC: endDate.toISOString(),
            endBrasilia: endBrasilia.toISOString(),
            nowBrasilia: brasiliaNow.toISOString(),
            isExpired: brasiliaNow > endBrasilia
          });
          
          return brasiliaNow > endBrasilia;
        });

        if (expiredCompetitions.length > 0) {
          console.log(`📋 Encontradas ${expiredCompetitions.length} competições expiradas`);
          
          // Finalizar cada competição expirada
          for (const competition of expiredCompetitions) {
            console.log(`🏁 Finalizando competição: ${competition.title}`);
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
