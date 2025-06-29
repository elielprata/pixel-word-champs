
import React from 'react';
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
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg text-gray-800 leading-tight mb-2 group-hover:text-gray-900 transition-colors duration-300">
          {title}
        </h3>
        
        {/* Status badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
          status === 'active' 
            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-200' 
            : 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-indigo-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            status === 'active' ? 'bg-white animate-pulse' : 'bg-white/80'
          }`}></span>
          {status === 'active' ? 'AO VIVO' : 'AGENDADO'}
        </div>
      </div>
      
      <div className="shrink-0 ml-4">
        <CircularProgressTimer 
          percentage={timeRemaining.percentage} 
          timeText={timeRemaining.text}
          status={status}
          size={80} 
        />
      </div>
    </div>
  );
};
