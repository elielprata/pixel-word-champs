
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { competitionStatusService } from '@/services/competitionStatusService';
import { useToast } from "@/hooks/use-toast";

export const useDailyCompetitionFinalization = () => {
  const { toast } = useToast();

  const finalizeExpiredCompetitions = async () => {
    try {
      console.log('🔍 [useDailyCompetitionFinalization] Verificando competições expiradas...');
      
      // Buscar competições diárias ativas que passaram do prazo
      const { data: expiredCompetitions, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'daily')
        .eq('status', 'active')
        .lt('end_date', new Date().toISOString());

      if (error) {
        console.error('❌ Erro ao buscar competições expiradas:', error);
        return;
      }

      if (!expiredCompetitions || expiredCompetitions.length === 0) {
        console.log('✅ Nenhuma competição diária expirada encontrada');
        return;
      }

      console.log(`📋 Encontradas ${expiredCompetitions.length} competições diárias expiradas`);

      // Finalizar cada competição expirada
      for (const competition of expiredCompetitions) {
        try {
          const { error: updateError } = await supabase
            .from('custom_competitions')
            .update({ 
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', competition.id);

          if (updateError) {
            console.error(`❌ Erro ao finalizar competição ${competition.id}:`, updateError);
          } else {
            console.log(`✅ Competição finalizada: ${competition.title}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao processar competição ${competition.id}:`, error);
        }
      }

      toast({
        title: "Competições Finalizadas",
        description: `${expiredCompetitions.length} competição(ões) diária(s) foram automaticamente finalizadas.`,
      });

    } catch (error) {
      console.error('❌ Erro geral na finalização de competições:', error);
    }
  };

  useEffect(() => {
    // Executar imediatamente
    finalizeExpiredCompetitions();

    // Configurar intervalo para execução a cada 30 segundos
    const interval = setInterval(finalizeExpiredCompetitions, 30000);

    return () => clearInterval(interval);
  }, []);
};
