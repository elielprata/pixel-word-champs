
import React from 'react';
import { Calendar, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CompetitionCard from './CompetitionCard';
import EmptyCompetitionsState from './EmptyCompetitionsState';

interface Competition {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
}

interface CompetitionsListProps {
  competitions: Competition[];
  onStartChallenge: (challengeId: number) => void;
  onRefresh: () => void;
}

const CompetitionsList = ({ competitions, onStartChallenge, onRefresh }: CompetitionsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Batalhas Ativas
            </h2>
            <p className="text-sm text-gray-600">
              {competitions.length} competições disponíveis
            </p>
          </div>
        </div>
        <Button onClick={onRefresh} variant="ghost" size="sm" className="hover:bg-purple-50">
          <RefreshCw className="w-4 h-4 text-purple-600" />
        </Button>
      </div>

      {competitions.length === 0 ? (
        <EmptyCompetitionsState onRefresh={onRefresh} />
      ) : (
        <div className="space-y-3">
          {competitions.map((competition) => (
            <CompetitionCard
              key={competition.id}
              competition={competition}
              onStartChallenge={onStartChallenge}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetitionsList;
