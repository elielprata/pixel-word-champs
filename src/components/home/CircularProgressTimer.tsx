
import React from 'react';
import { Zap, Clock } from 'lucide-react';

interface CircularProgressTimerProps {
  percentage: number;
  timeText: string;
  status: 'scheduled' | 'active' | 'completed';
  size?: number;
}

export const CircularProgressTimer = ({ 
  percentage, 
  timeText, 
  status, 
  size = 80 
}: CircularProgressTimerProps) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const isActive = status === 'active';
  
  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size + 20 }}>
      {/* SVG Circle */}
      <svg
        className="transform -rotate-90 drop-shadow-lg"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-white/30"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${
            isActive 
              ? 'text-emerald-500 drop-shadow-sm' 
              : 'text-indigo-500 drop-shadow-sm'
          } transition-all duration-1000 ease-out`}
          style={{
            filter: isActive ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))' : 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {/* Icon with glow effect */}
          <div className={`mb-1 ${isActive ? 'animate-pulse' : ''}`}>
            {isActive ? (
              <Zap className="w-5 h-5 mx-auto text-emerald-600 drop-shadow-sm" 
                   style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.6))' }} />
            ) : (
              <Clock className="w-5 h-5 mx-auto text-indigo-600 drop-shadow-sm" 
                     style={{ filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.6))' }} />
            )}
          </div>
          
          {/* Percentage or indicator */}
          <div className={`text-xs font-bold ${
            isActive ? 'text-emerald-700' : 'text-indigo-700'
          } drop-shadow-sm`}>
            {isActive ? `${Math.round(percentage)}%` : '⏰'}
          </div>
        </div>
      </div>
      
      {/* Time text below */}
      <div className={`text-center mt-2 font-bold text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
        isActive 
          ? 'text-emerald-800 bg-emerald-100/50 border border-emerald-200/50' 
          : 'text-indigo-800 bg-indigo-100/50 border border-indigo-200/50'
      } shadow-sm`}>
        {timeText}
      </div>
    </div>
  );
};
