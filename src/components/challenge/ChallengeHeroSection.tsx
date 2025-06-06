
import React from 'react';
import { Target } from 'lucide-react';

interface ChallengeHeroSectionProps {
  title: string;
  description: string;
  color: string;
}

const ChallengeHeroSection = ({ title, description, color }: ChallengeHeroSectionProps) => {
  return (
    <div className={`bg-gradient-to-r ${color} rounded-xl p-4 text-white relative overflow-hidden`}>
      <div className="absolute inset-0 bg-black/5 backdrop-blur-sm"></div>
      <div className="relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2 backdrop-blur-sm">
          <Target className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        <p className="text-sm opacity-90 mb-3">{description}</p>
        
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
            <div className="text-lg font-bold">20</div>
            <div className="text-xs opacity-80">Níveis</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
            <div className="text-lg font-bold">3:00</div>
            <div className="text-xs opacity-80">Por nível</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
            <div className="text-lg font-bold">1</div>
            <div className="text-xs opacity-80">Dica grátis</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeHeroSection;
