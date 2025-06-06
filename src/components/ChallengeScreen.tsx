import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import ChallengeHeader from './challenge/ChallengeHeader';
import ChallengeHeroSection from './challenge/ChallengeHeroSection';
import GameRules from './challenge/GameRules';
import PowerUpsSection from './challenge/PowerUpsSection';
import StartButton from './challenge/StartButton';
import GameHeader from './challenge/GameHeader';

interface ChallengeScreenProps {
  challengeId: number;
  onBack: () => void;
}

const ChallengeScreen = ({ challengeId, onBack }: ChallengeScreenProps) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [score, setScore] = useState(0);

  const challengeData = {
    1: { 
      title: "Desafio Matinal", 
      description: "Palavras relacionadas ao café da manhã",
      theme: "🌅 Manhã",
      color: "from-amber-400 to-orange-500"
    },
    2: { 
      title: "Animais Selvagens", 
      description: "Encontre os animais escondidos",
      theme: "🦁 Fauna",
      color: "from-green-400 to-emerald-500"
    },
    3: { 
      title: "Cidades do Brasil", 
      description: "Conheça as cidades brasileiras",
      theme: "🇧🇷 Geografia",
      color: "from-blue-400 to-cyan-500"
    },
  }[challengeId] || { 
    title: "Desafio", 
    description: "Encontre as palavras escondidas",
    theme: "🎯 Geral",
    color: "from-purple-400 to-pink-500"
  };

  useEffect(() => {
    if (isGameStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isGameStarted, timeRemaining]);

  const startGame = () => {
    setShowInstructions(false);
    setIsGameStarted(true);
  };

  const handleWordFound = (word: string, points: number) => {
    setScore(prev => prev + points);
  };

  const handleTimeUp = () => {
    console.log('Tempo esgotado!');
  };

  if (showInstructions) {
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
          
          <StartButton onStart={startGame} color={challengeData.color} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <GameHeader 
        onBack={onBack}
        currentLevel={currentLevel}
        timeRemaining={timeRemaining}
        score={score}
      />

      <div className="p-4">
        <GameBoard 
          level={currentLevel} 
          timeLeft={timeRemaining}
          onWordFound={handleWordFound}
          onTimeUp={handleTimeUp}
        />
      </div>
    </div>
  );
};

export default ChallengeScreen;
