
import React from 'react';
import { Trophy, RefreshCw, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="p-4">
      {/* Header with Game Style */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Desafios Ativos</h3>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
              <span className="text-xs text-slate-600">{competitions.length} disponíveis</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onRefresh} 
          variant="ghost" 
          size="sm"
          className="w-8 h-8 p-0 bg-white/60 hover:bg-white/80 rounded-lg border border-slate-200"
        >
          <RefreshCw className="w-4 h-4 text-slate-600" />
        </Button>
      </div>

      {/* Competitions */}
      {competitions.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
          <EmptyCompetitionsState onRefresh={onRefresh} />
        </div>
      ) : (
        <div className="space-y-3">
          {competitions.map((competition) => (
            <div key={competition.id} className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 p-1">
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg">
                <CompetitionCard
                  competition={competition}
                  onStartChallenge={onStartChallenge}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetitionsList;
