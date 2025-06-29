
import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CompetitionCard from './CompetitionCard';
import EmptyCompetitionsState from './EmptyCompetitionsState';
import { Competition } from '@/types';

interface CompetitionsListProps {
  competitions: Competition[];
  onStartChallenge: (challengeId: string) => void;
  onRefresh: () => void;
}

const CompetitionsList = ({ competitions, onStartChallenge, onRefresh }: CompetitionsListProps) => {
  // Filtrar e limitar competições agendadas a no máximo 3
  const scheduledCompetitions = competitions
    .filter(comp => comp.status === 'scheduled')
    .slice(0, 3);

  // Filtrar competições ativas
  const activeCompetitions = competitions.filter(comp => comp.status === 'active');

  const handleJoin = (competitionId: string) => {
    onStartChallenge(competitionId);
  };

  const handleViewRanking = (competitionId: string) => {
    console.log('Ver ranking da competição:', competitionId);
  };

  const totalCompetitions = activeCompetitions.length + scheduledCompetitions.length;

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-slate-800">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            Competições ({totalCompetitions})
          </CardTitle>
          <Button onClick={onRefresh} variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        {totalCompetitions === 0 ? (
          <EmptyCompetitionsState onRefresh={onRefresh} />
        ) : (
          <div className="space-y-3">
            {/* Competições Ativas */}
            {activeCompetitions.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                onJoin={handleJoin}
                onViewRanking={handleViewRanking}
              />
            ))}
            
            {/* Competições Agendadas (máximo 3) */}
            {scheduledCompetitions.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                onJoin={handleJoin}
                onViewRanking={handleViewRanking}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompetitionsList;
