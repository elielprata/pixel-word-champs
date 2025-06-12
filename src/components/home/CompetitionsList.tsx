
import React from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
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
  const handleJoin = (competitionId: string) => {
    onStartChallenge(competitionId);
  };

  const handleViewRanking = (competitionId: string) => {
    console.log('Ver ranking da competição:', competitionId);
  };

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-slate-800">
            <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            Competições Ativas ({competitions.length})
          </CardTitle>
          <Button onClick={onRefresh} variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        {competitions.length === 0 ? (
          <EmptyCompetitionsState onRefresh={onRefresh} />
        ) : (
          <div className="space-y-3">
            {competitions.map((competition) => (
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
