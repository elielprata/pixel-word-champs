
import React from 'react';

interface ScoreDisplayProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success';
}

const ScoreDisplay = ({ 
  score, 
  label = 'pontos', 
  size = 'md',
  color = 'primary' 
}: ScoreDisplayProps) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  const colorClasses = {
    primary: 'text-purple-600',
    secondary: 'text-gray-600',
    success: 'text-green-600'
  };

  return (
    <div className="text-right">
      <p className={`font-bold ${sizeClasses[size]} ${colorClasses[color]}`}>
        {score.toLocaleString()}
      </p>
      {label && <p className="text-xs text-gray-500">{label}</p>}
    </div>
  );
};

export default ScoreDisplay;
