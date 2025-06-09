
import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface CompetitionCardProps {
  competition: Competition;
  onStartChallenge: (challengeId: number) => void;
}

const CompetitionCard = ({ competition, onStartChallenge }: CompetitionCardProps) => {
  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizada';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTimeColor = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours <= 1) return 'text-red-600';
    if (hours <= 6) return 'text-orange-600';
    return 'text-emerald-600';
  };

  return (
    <Card className="border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">
                {competition.title}
              </h3>
              
              {competition.theme && (
                <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 text-xs px-2 py-0.5">
                  {competition.theme}
                </Badge>
              )}
            </div>
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
            <Clock className={`w-4 h-4 ${getTimeColor(competition.end_date)}`} />
            <div>
              <span className="text-xs text-slate-600 block">Tempo restante</span>
              <span className={`text-sm font-bold ${getTimeColor(competition.end_date)}`}>
                {formatTimeRemaining(competition.end_date)}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={() => onStartChallenge(parseInt(competition.id))}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold text-sm py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            PARTICIPAR AGORA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionCard;
