
import React from 'react';
import { Zap, Clock } from 'lucide-react';
import { CircularProgressTimer } from './CircularProgressTimer';

interface CompetitionCardHeaderProps {
  title: string;
  status: 'scheduled' | 'active' | 'completed';
  timeRemaining: {
    text: string;
    percentage: number;
  };
}

export const CompetitionCardHeader = ({ 
  title, 
  status, 
  timeRemaining 
}: CompetitionCardHeaderProps) => {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center gap-2 flex-1">
        <div className="p-1.5 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-lg shadow-md hover-lift transition-all duration-300">
          {status === 'active' ? (
            <Zap className="w-3.5 h-3.5 text-primary-foreground" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-primary-foreground" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm text-foreground leading-tight hover:text-primary transition-colors duration-300">
            {title}
          </h3>
        </div>
      </div>
      
      <div className="shrink-0">
        <CircularProgressTimer 
          percentage={timeRemaining.percentage} 
          timeText={timeRemaining.text}
          status={status}
          size={70} 
        />
      </div>
    </div>
  );
};
