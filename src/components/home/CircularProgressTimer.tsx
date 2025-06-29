
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
  size = 70 
}: CircularProgressTimerProps) => {
  const radius = (size - 6) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size + 16 }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={status === 'active' ? 'text-green-500' : 'text-blue-500'}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {status === 'active' ? (
            <Zap className="w-4 h-4 mx-auto text-green-600 mb-0.5" />
          ) : (
            <Clock className="w-4 h-4 mx-auto text-blue-600 mb-0.5" />
          )}
          <div className="text-xs font-bold text-gray-700">
            {status === 'active' ? Math.round(percentage) + '%' : '⏰'}
          </div>
        </div>
      </div>
      <div className={`text-center mt-1 font-bold text-xs ${status === 'active' ? 'text-green-700' : 'text-blue-700'}`}>
        {timeText}
      </div>
    </div>
  );
};
