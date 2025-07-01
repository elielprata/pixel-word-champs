
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CompetitionCardHeader } from './CompetitionCardHeader';
import CompetitionCardButton from './CompetitionCardButton';
import { CompetitionCardDecorations } from './CompetitionCardDecorations';
import { CircularProgressTimer } from './CircularProgressTimer';
import { Competition } from '@/types';

interface CompetitionCardProps {
  competition: Competition;
  onStartChallenge: (challengeId: string) => void;
}

const CompetitionCard = ({ competition, onStartChallenge }: CompetitionCardProps) => {
  const isActive = competition.status === 'active';
  const isScheduled = competition.status === 'scheduled';
  const isCompleted = competition.status === 'completed';

  const handleStartChallenge = () => {
    if (isActive) {
      onStartChallenge(competition.id);
    }
  };

  const cardClasses = `
    relative overflow-hidden transition-all duration-300 safe-interactive no-tap-highlight
    ${isActive 
      ? 'bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 hover-shadow hover:brightness-110' 
      : isScheduled 
        ? 'bg-gradient-to-br from-yellow-50 to-orange-100 border-orange-200 hover-shadow'
        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
    }
  `;

  return (
    <Card className={cardClasses}>
      <CardContent className="p-4 relative">
        <CompetitionCardDecorations 
          isActive={isActive}
          isScheduled={isScheduled}
          isCompleted={isCompleted}
        />

        <div className="relative z-10">
          <CompetitionCardHeader 
            title={competition.title}
            description={competition.description}
            theme={competition.theme}
            status={competition.status}
          />
          
          <div className="flex items-center justify-between mt-4">
            <CircularProgressTimer 
              startDate={competition.start_date}
              endDate={competition.end_date}
              status={competition.status}
              size="small"
            />
            
            <CompetitionCardButton
              competition={competition}
              onStartChallenge={handleStartChallenge}
              isActive={isActive}
              isScheduled={isScheduled}
              isCompleted={isCompleted}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionCard;
