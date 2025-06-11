
import { useEffect } from 'react';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
import { CompetitionStatusService } from '@/services/competitionStatusService';
import { supabase } from '@/integrations/supabase/client';
import { getBrasiliaTime, formatBrasiliaTime } from '@/utils/brasiliaTime';

export const useDailyCompetitionFinalization = () => {
  useEffect(() => {
    const checkExpiredCompetitions = async () => {
      try {
        console.log('🔍 Verificando competições diárias para atualização de status...');
        
        const now = getBrasiliaTime();
        console.log('🕐 Horário atual (Brasília):', formatBrasiliaTime(now));
        
        // Buscar todas as competições diárias
        const { data: dailyCompetitions, error } = await supabase
          .from('custom_competitions')
          .select('id, title, start_date, end_date, status')
          .eq('competition_type', 'challenge');

        if (error) {
          console.error('❌ Erro ao buscar competições diárias:', error);
          return;
        }

        if (dailyCompetitions && dailyCompetitions.length > 0) {
          console.log(`📋 Encontradas ${dailyCompetitions.length} competições diárias para verificar`);
          
          // CORREÇÃO: Verificar e atualizar status de cada competição diária
          for (const competition of dailyCompetitions) {
            console.log(`🔍 Verificando competição diária: ${competition.title}`);
            
            // Calcular status correto baseado nas regras de competição diária
            const correctStatus = CompetitionStatusService.calculateDailyCompetitionStatus(competition.start_date);
            
            console.log(`📊 Status atual: "${competition.status}" | Status correto: "${correctStatus}"`);
            
            // Atualizar status se necessário
            if (competition.status !== correctStatus) {
              console.log(`🔄 Atualizando status de "${competition.status}" para "${correctStatus}"`);
              await CompetitionStatusService.updateSingleCompetitionStatus(competition.id);
            }
            
            // Se a competição foi finalizada, executar finalização
            if (competition.status === 'active' && correctStatus === 'completed') {
              console.log(`🏁 Finalizando competição diária: ${competition.title}`);
              await dailyCompetitionService.finalizeDailyCompetition(competition.id);
            }
          }
        } else {
          console.log('✅ Nenhuma competição diária encontrada');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar competições diárias:', error);
      }
    };

    // Verificar imediatamente
    checkExpiredCompetitions();

    // Verificar a cada 2 minutos para manter status atualizados (reduzido de 5 para 2 minutos para correção mais rápida)
    const interval = setInterval(checkExpiredCompetitions, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
