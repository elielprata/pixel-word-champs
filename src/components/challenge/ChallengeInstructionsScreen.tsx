
import React from 'react';
import ChallengeHeader from './ChallengeHeader';
import ChallengeHeroSection from './ChallengeHeroSection';
import GameRules from './GameRules';
import PowerUpsSection from './PowerUpsSection';
import StartButton from './StartButton';

interface ChallengeInstructionsScreenProps {
  challengeData: {
    title: string;
    description: string;
    theme: string;
    color: string;
  };
  onBack: () => void;
  onStart: () => void;
}

const ChallengeInstructionsScreen = ({ 
  challengeData, 
  onBack, 
  onStart 
}: ChallengeInstructionsScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <ChallengeHeader onBack={onBack} theme={challengeData.theme} />
      
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <ChallengeHeroSection 
          title={challengeData.title}
          description={challengeData.description}
          color={challengeData.color}
        />
        
        <GameRules />
        
        <PowerUpsSection />
        
        <StartButton onStart={onStart} color={challengeData.color} />
      </div>
    </div>
  );
};

export default ChallengeInstructionsScreen;
