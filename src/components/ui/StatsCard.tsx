import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  onClick?: () => void;
  className?: string;
  valueClassName?: string;
  loading?: boolean;
}

export const StatsCard = ({ 
  icon, 
  label, 
  value, 
  onClick, 
  className = '',
  valueClassName = '',
  loading = false 
}: StatsCardProps) => {
  const isClickable = !!onClick;
  
  if (loading) {
    return (
      <div className={`bg-white/20 backdrop-blur-sm rounded-xl p-3 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-4 h-4 bg-white/30 rounded"></div>
            <div className="h-3 bg-white/30 rounded w-16"></div>
          </div>
          <div className="h-6 bg-white/30 rounded w-12"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        bg-white/20 backdrop-blur-sm rounded-xl p-3 transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:bg-white/30 active:scale-95' : ''}
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      aria-label={isClickable ? `Ver detalhes de ${label}` : undefined}
    >
      <div className="flex items-center space-x-2 mb-1">
        {icon}
        <span className="text-xs text-purple-100/90 font-medium">{label}</span>
      </div>
      <p className={`text-xl font-bold text-white ${valueClassName}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
};