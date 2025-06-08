
import { useState, useEffect } from 'react';
import { competitionService } from '@/services/competitionService';
import { customCompetitionService } from '@/services/customCompetitionService';
import { CompetitionHistoryItem, DebugInfo } from './types';

export const useCompetitionData = () => {
  const [allCompetitionsData, setAllCompetitionsData] = useState<CompetitionHistoryItem[]>([]);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllCompetitions = async () => {
      try {
        console.log('🔍 Loading all competitions for history...');
        setIsLoading(true);

        // Buscar competições do sistema
        const systemResponse = await competitionService.getActiveCompetitions();
        console.log('🎯 System competitions response:', systemResponse);

        // Buscar competições customizadas
        const customResponse = await customCompetitionService.getCustomCompetitions();
        console.log('📋 Custom competitions response:', customResponse);

        const systemCompetitions = systemResponse.success ? systemResponse.data : [];
        const customCompetitionsData = customResponse.success ? customResponse.data : [];

        console.log('📊 Processing competitions:', {
          system: systemCompetitions.length,
          custom: customCompetitionsData.length
        });

        // Converter competições do sistema para o formato correto
        const formattedSystemCompetitions: CompetitionHistoryItem[] = systemCompetitions
          .filter(comp => comp.is_active === false) // Mostrar apenas finalizadas
          .map(comp => ({
            id: comp.id,
            title: comp.title,
            competition_type: comp.type === 'weekly' ? 'Semanal' : 'Diária',
            status: 'completed',
            participants: comp.total_participants || 0,
            prize_pool: Number(comp.prize_pool) || 0,
            start_date: comp.week_start || comp.created_at,
            end_date: comp.week_end || comp.updated_at,
            source: 'system' as const,
            created_at: comp.created_at,
            updated_at: comp.updated_at,
            max_participants: 1000,
            total_participants: comp.total_participants || 0
          }));

        // Converter competições customizadas para o formato correto
        const formattedCustomCompetitions: CompetitionHistoryItem[] = customCompetitionsData
          .filter(comp => comp.status === 'completed' || comp.status === 'finished') // Mostrar apenas finalizadas
          .map(comp => ({
            id: comp.id,
            title: comp.title,
            competition_type: comp.competition_type === 'tournament' ? 'Torneio' : 
                            comp.competition_type === 'challenge' ? 'Desafio' : 'Competição',
            status: comp.status === 'completed' || comp.status === 'finished' ? 'completed' : 'active',
            participants: 0, // TODO: buscar participantes reais
            prize_pool: Number(comp.prize_pool) || 0,
            start_date: comp.start_date || comp.created_at,
            end_date: comp.end_date || comp.updated_at,
            source: 'custom' as const,
            theme: comp.theme,
            created_at: comp.created_at,
            updated_at: comp.updated_at,
            max_participants: comp.max_participants || 1000,
            total_participants: 0
          }));

        // Mostrar TODAS as competições customizadas para debug (incluindo ativas)
        const allCustomForDebug: CompetitionHistoryItem[] = customCompetitionsData.map(comp => ({
          id: comp.id,
          title: comp.title,
          competition_type: comp.competition_type === 'tournament' ? 'Torneio' : 
                          comp.competition_type === 'challenge' ? 'Desafio' : 'Competição',
          status: comp.status,
          participants: 0,
          prize_pool: Number(comp.prize_pool) || 0,
          start_date: comp.start_date || comp.created_at,
          end_date: comp.end_date || comp.updated_at,
          source: 'custom' as const,
          theme: comp.theme,
          created_at: comp.created_at,
          updated_at: comp.updated_at,
          max_participants: comp.max_participants || 1000,
          total_participants: 0
        }));

        console.log('📋 Competições customizadas (TODAS para debug):', allCustomForDebug);
        console.log('📋 Competições customizadas finalizadas:', formattedCustomCompetitions);
        console.log('🎯 Competições do sistema finalizadas:', formattedSystemCompetitions);

        const allCompetitions = [...formattedSystemCompetitions, ...formattedCustomCompetitions];
        console.log('📊 Total de competições finalizadas:', allCompetitions);

        setAllCompetitionsData(allCompetitions);

        // Definir informações de debug
        setDebugInfo({
          customCompetitions: formattedCustomCompetitions.length,
          systemCompetitions: formattedSystemCompetitions.length,
          totalCompetitions: systemCompetitions.length,
          totalCustom: customCompetitionsData.length,
          customError: customResponse.success ? undefined : customResponse.error,
          systemError: systemResponse.success ? undefined : systemResponse.error
        });

        if (allCompetitions.length === 0) {
          console.log('ℹ️ Nenhuma competição finalizada encontrada. Verificando se há competições ativas...');
          
          // Para debug, mostrar também as ativas
          const activeSystemCompetitions = systemCompetitions.filter(comp => comp.is_active === true);
          const activeCustomCompetitions = customCompetitionsData.filter(comp => comp.status === 'active');
          
          console.log('✅ Competições ativas encontradas:', activeSystemCompetitions.length, activeSystemCompetitions);
          console.log('📊 Competições customizadas ativas:', activeCustomCompetitions.length, activeCustomCompetitions);

          // Temporariamente mostrar as ativas também
          const tempAllCompetitions = [
            ...activeSystemCompetitions.map(comp => ({
              id: comp.id,
              title: comp.title,
              competition_type: comp.type === 'weekly' ? 'Semanal' : 'Diária',
              status: 'active',
              participants: comp.total_participants || 0,
              prize_pool: Number(comp.prize_pool) || 0,
              start_date: comp.week_start || comp.created_at,
              end_date: comp.week_end || comp.updated_at,
              source: 'system' as const,
              created_at: comp.created_at,
              updated_at: comp.updated_at,
              max_participants: 1000,
              total_participants: comp.total_participants || 0
            })),
            ...allCustomForDebug
          ];

          console.log('📊 Competições formatadas:', tempAllCompetitions.length, tempAllCompetitions);
          setAllCompetitionsData(tempAllCompetitions);
        }

      } catch (error) {
        console.error('❌ Error loading competitions history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllCompetitions();
  }, []);

  return {
    allCompetitionsData,
    debugInfo,
    isLoading
  };
};
