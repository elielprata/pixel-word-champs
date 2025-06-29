
import React from 'react';
import { Users } from 'lucide-react';

interface CompetitionCardContentProps {
  description?: string;
  theme?: string;
  totalParticipants?: number;
  maxParticipants?: number;
}

export const CompetitionCardContent = ({ 
  description, 
  theme, 
  totalParticipants = 0, 
  maxParticipants = 0 
}: CompetitionCardContentProps) => {
  return (
    <div className="space-y-3 mb-4">
      {/* Descrição */}
      {description && (
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
            {description}
          </p>
        </div>
      )}

      {/* Tema e Participantes */}
      <div className="flex items-center justify-between">
        {theme && (
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-indigo-200/30">
            <span className="text-xs font-bold text-indigo-700">
              🎯 {theme}
            </span>
          </div>
        )}

        {maxParticipants > 0 && (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-emerald-200/30">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">
              {totalParticipants}/{maxParticipants}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
