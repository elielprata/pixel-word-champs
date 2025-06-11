
import React from 'react';
import CompetitionCard from './CompetitionCard';
import EmptyCompetitionsState from './EmptyCompetitionsState';

interface Competition {
  id: string;
  title: string;
  description: string;
  theme: string;
  category?: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
}

interface CompetitionsListProps {
  competitions: Competition[];
  onStartChallenge: (challengeId: string) => void;
  onRefresh: () => void;
}

const CompetitionsList = ({ competitions, onStartChallenge, onRefresh }: CompetitionsListProps) => {
  console.log('🎯 CompetitionsList - Competições recebidas:', competitions.map(c => ({
    id: c.id,
    title: c.title,
    category: c.category || 'sem categoria'
  })));

  if (competitions.length === 0) {
    return <EmptyCompetitionsState onRefresh={onRefresh} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Competições Ativas</h2>
        <span className="text-sm text-gray-500">{competitions.length} disponível(is)</span>
      </div>
      
      {competitions.map((competition) => (
        <CompetitionCard
          key={competition.id}
          competition={competition}
          onStartChallenge={onStartChallenge}
        />
      ))}
    </div>
  );
};

export default CompetitionsList;
