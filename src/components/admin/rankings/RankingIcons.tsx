
import React from 'react';
import { Crown, Medal, Award } from 'lucide-react';

export const getRankingIcon = (position: number) => {
  switch (position) {
    case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2: return <Medal className="w-5 h-5 text-gray-400" />;
    case 3: return <Award className="w-5 h-5 text-orange-500" />;
    default: return (
      <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600 bg-gray-100 rounded-full">
        {position}
      </div>
    );
  }
};

export const getRankingColors = (position: number) => {
  switch (position) {
    case 1: return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
    case 2: return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
    case 3: return "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200";
    default: return "bg-white border-gray-200";
  }
};
