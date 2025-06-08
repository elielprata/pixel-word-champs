
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, Filter } from 'lucide-react';
import { useCompetitions } from '@/hooks/useCompetitions';
import { competitionService } from '@/services/competitionService';
import { customCompetitionService } from '@/services/customCompetitionService';
import { CompetitionFilters } from './history/CompetitionFilters';
import { CompetitionTable } from './history/CompetitionTable';
import { CompetitionStats } from './history/CompetitionStats';
import { DebugInfo } from './history/DebugInfo';

interface CompetitionData {
  id: string;
  title: string;
  type: string;
  status: string;
  participants: number;
  prizePool: number;
  startDate: string;
  endDate: string;
  source: 'system' | 'custom';
}

export const CompetitionHistory = () => {
  const { customCompetitions, competitions, isLoading } = useCompetitions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [allCompetitionsData, setAllCompetitionsData] = useState<CompetitionData[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  console.log('🔍 CompetitionHistory - Raw data:', {
    customCompetitions,
    competitions,
    isLoading
  });

  useEffect(() => {
    const loadAllCompetitions = async () => {
      try {
        console.log('🔍 Loading all competitions for history...');

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

        // Converter competições do sistema
        const formattedSystemCompetitions: CompetitionData[] = systemCompetitions
          .filter(comp => comp.is_active === false) // Mostrar apenas finalizadas
          .map(comp => ({
            id: comp.id,
            title: comp.title,
            type: comp.type === 'weekly' ? 'Semanal' : 'Diária',
            status: 'completed',
            participants: comp.total_participants || 0,
            prizePool: Number(comp.prize_pool) || 0,
            startDate: comp.week_start || comp.created_at,
            endDate: comp.week_end || comp.updated_at,
            source: 'system' as const
          }));

        // Converter competições customizadas
        const formattedCustomCompetitions: CompetitionData[] = customCompetitionsData
          .filter(comp => comp.status === 'completed' || comp.status === 'finished') // Mostrar apenas finalizadas
          .map(comp => ({
            id: comp.id,
            title: comp.title,
            type: comp.competition_type === 'tournament' ? 'Torneio' : 
                  comp.competition_type === 'challenge' ? 'Desafio' : 'Competição',
            status: comp.status === 'completed' || comp.status === 'finished' ? 'completed' : 'active',
            participants: 0, // TODO: buscar participantes reais
            prizePool: Number(comp.prize_pool) || 0,
            startDate: comp.start_date || comp.created_at,
            endDate: comp.end_date || comp.updated_at,
            source: 'custom' as const
          }));

        // Mostrar TODAS as competições customizadas para debug (incluindo ativas)
        const allCustomForDebug: CompetitionData[] = customCompetitionsData.map(comp => ({
          id: comp.id,
          title: comp.title,
          type: comp.competition_type === 'tournament' ? 'Torneio' : 
                comp.competition_type === 'challenge' ? 'Desafio' : 'Competição',
          status: comp.status,
          participants: 0,
          prizePool: Number(comp.prize_pool) || 0,
          startDate: comp.start_date || comp.created_at,
          endDate: comp.end_date || comp.updated_at,
          source: 'custom' as const
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
              type: comp.type === 'weekly' ? 'Semanal' : 'Diária',
              status: 'active',
              participants: comp.total_participants || 0,
              prizePool: Number(comp.prize_pool) || 0,
              startDate: comp.week_start || comp.created_at,
              endDate: comp.week_end || comp.updated_at,
              source: 'system' as const
            })),
            ...allCustomForDebug
          ];

          console.log('📊 Competições formatadas:', tempAllCompetitions.length, tempAllCompetitions);
          setAllCompetitionsData(tempAllCompetitions);
        }

      } catch (error) {
        console.error('❌ Error loading competitions history:', error);
      }
    };

    loadAllCompetitions();
  }, [customCompetitions, competitions]);

  // Filtrar competições
  const filteredCompetitions = allCompetitionsData.filter(competition => {
    const matchesSearch = competition.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || competition.status === statusFilter;
    const matchesType = typeFilter === 'all' || competition.type.toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-slate-600 mt-4">Carregando histórico de competições...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <DebugInfo debugInfo={debugInfo} />

      {/* Filtros */}
      <CompetitionFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      {/* Estatísticas */}
      <CompetitionStats competitions={allCompetitionsData} />

      {/* Lista de Competições */}
      {filteredCompetitions.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Nenhuma competição encontrada
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Não há competições que correspondem aos filtros selecionados.'
                : 'Ainda não há competições finalizadas no sistema.'}
            </p>
            <div className="text-sm text-slate-500">
              <p>Total de competições no sistema: {debugInfo?.totalCompetitions || 0}</p>
              <p>Total de competições customizadas: {debugInfo?.totalCustom || 0}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <CompetitionTable competitions={filteredCompetitions} />
      )}
    </div>
  );
};
