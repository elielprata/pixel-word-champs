
import React from 'react';
import { Competition } from '@/types';
import CompetitionCard from './CompetitionCard';
import EmptyCompetitionsState from './EmptyCompetitionsState';
import { useOptimizedCompetitions } from '@/hooks/competitions/useOptimizedCompetitions';

interface CompetitionsListProps {
  onJoinCompetition: (competitionId: string) => void;
}

const CompetitionsList: React.FC<CompetitionsListProps> = ({ onJoinCompetition }) => {
  const { competitions, dailyCompetition, weeklyCompetition, isLoading, error } = useOptimizedCompetitions();

  if (isLoading) {
    return <p>Carregando competições...</p>;
  }

  if (error) {
    return <p>Erro ao carregar competições: {error}</p>;
  }

  if (!competitions || competitions.length === 0 && !dailyCompetition && !weeklyCompetition) {
    return <EmptyCompetitionsState onRefresh={() => {}} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {dailyCompetition && (
        <CompetitionCard
          competition={dailyCompetition}
          onJoin={onJoinCompetition}
          onViewRanking={() => {}}
        />
      )}
      {weeklyCompetition && (
        <CompetitionCard
          competition={weeklyCompetition}
          onJoin={onJoinCompetition}
          onViewRanking={() => {}}
        />
      )}
      {competitions && competitions.map((competition) => (
        <CompetitionCard
          key={competition.id}
          competition={competition}
          onJoin={onJoinCompetition}
          onViewRanking={() => {}}
        />
      ))}
    </div>
  );
};

export default CompetitionsList;
