
import React from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  onStartChallenge: (challengeId: string) => void;
  onRefresh: () => void;
}

const CompetitionsList = ({ competitions, onStartChallenge, onRefresh }: CompetitionsListProps) => {
  return (
    <div className="border-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg">
      <div className="p-6 pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base flex items-center gap-2 text-slate-800 font-semibold">
            <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            Competições Ativas ({competitions.length})
          </h2>
          <Button onClick={onRefresh} variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-3 pt-0">
        {competitions.length === 0 ? (
          <EmptyCompetitionsState onRefresh={onRefresh} />
        ) : (
          <div className="space-y-3">
            {competitions.map((competition) => (
              <div key={competition.id} className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-bold text-slate-800">{competition.title}</h3>
                <p className="text-sm text-slate-600">{competition.theme}</p>
                <Button 
                  onClick={() => onStartChallenge(competition.id)}
                  className="mt-2 w-full"
                >
                  Participar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionsList;
