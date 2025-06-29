
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CompetitionCard from './CompetitionCard';
import EmptyCompetitionsState from './EmptyCompetitionsState';
import { Competition } from '@/types';

interface CompetitionsListProps {
  competitions: Competition[];
  onStartChallenge: (challengeId: string) => void;
  onRefresh: () => void;
}

const CompetitionsList = ({ competitions, onStartChallenge, onRefresh }: CompetitionsListProps) => {
  // Filtrar competições ativas e agendadas
  const activeCompetitions = competitions.filter(comp => comp.status === 'active');
  const scheduledCompetitions = competitions
    .filter(comp => comp.status === 'scheduled')
    .slice(0, 3); // Limitar a 3 competições agendadas

  const handleJoin = (competitionId: string) => {
    onStartChallenge(competitionId);
  };

  const handleViewRanking = (competitionId: string) => {
    console.log('Ver ranking da competição:', competitionId);
  };

  const totalCompetitions = activeCompetitions.length + scheduledCompetitions.length;

  if (totalCompetitions === 0) {
    return (
      <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-3">
          <EmptyCompetitionsState onRefresh={onRefresh} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Competições Ativas */}
      {activeCompetitions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Competições Ativas</h2>
            <Button onClick={onRefresh} variant="ghost" size="sm" className="h-8 w-8 p-0">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-0">
            {activeCompetitions.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                onJoin={handleJoin}
                onViewRanking={handleViewRanking}
              />
            ))}
          </div>
        </div>
      )}

      {/* Próximas Competições (Agendadas) */}
      {scheduledCompetitions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Próximas Competições</h2>
          
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            {scheduledCompetitions.map((competition, index) => (
              <div key={competition.id}>
                <CompetitionCard
                  competition={competition}
                  onJoin={handleJoin}
                  onViewRanking={handleViewRanking}
                />
                {index < scheduledCompetitions.length - 1 && (
                  <div className="border-b border-gray-100 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionsList;
