
import React, { useState } from 'react';
import { useCompetitions } from '@/hooks/useCompetitions';
import { CompetitionFilters } from './history/CompetitionFilters';
import { CompetitionTable } from './history/CompetitionTable';
import { CompetitionStats } from './history/CompetitionStats';
import { DebugInfo } from './history/DebugInfo';
import { EmptyState } from './history/EmptyState';
import { LoadingState } from './history/LoadingState';
import { useCompetitionData } from './history/useCompetitionData';

export const CompetitionHistory = () => {
  const { isLoading: hookLoading } = useCompetitions();
  const { allCompetitionsData, debugInfo, isLoading: dataLoading } = useCompetitionData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  console.log('🔍 CompetitionHistory - Data:', {
    allCompetitionsData: allCompetitionsData.length,
    isLoading: hookLoading || dataLoading
  });

  // Filtrar competições
  const filteredCompetitions = allCompetitionsData.filter(competition => {
    const matchesSearch = competition.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || competition.status === statusFilter;
    const matchesType = typeFilter === 'all' || competition.competition_type.toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (hookLoading || dataLoading) {
    return <LoadingState />;
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
        <EmptyState
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          debugInfo={debugInfo}
        />
      ) : (
        <CompetitionTable competitions={filteredCompetitions} />
      )}
    </div>
  );
};
