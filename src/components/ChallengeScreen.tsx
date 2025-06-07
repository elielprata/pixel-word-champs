
import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import ChallengeHeader from './challenge/ChallengeHeader';
import ChallengeHeroSection from './challenge/ChallengeHeroSection';
import GameRules from './challenge/GameRules';
import PowerUpsSection from './challenge/PowerUpsSection';
import StartButton from './challenge/StartButton';
import GameHeader from './challenge/GameHeader';
import { useLevelProgression } from '@/hooks/useLevelProgression';

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
  const [currentLevelScore, setCurrentLevelScore] = useState(0);
  
  const { 
    totalScore, 
    saveLevelProgress, 
    getHighestCompletedLevel,
    isLoading 
  } = useLevelProgression(challengeId);

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

  // Reset to level 1 when component mounts (when entering the challenge)
  useEffect(() => {
    setCurrentLevel(1);
    setScore(0);
    setCurrentLevelScore(0);
    setTimeRemaining(180);
    setIsGameStarted(false);
    setShowInstructions(true);
  }, [challengeId]);

  const startGame = () => {
    setShowInstructions(false);
    setIsGameStarted(true);
    setScore(0); // Always start with 0 score
    setCurrentLevelScore(0);
  };

  const handleWordFound = (word: string, points: number) => {
    setCurrentLevelScore(prev => prev + points);
  };

  const handleLevelComplete = async (levelScore: number) => {
    console.log(`Nível ${currentLevel} completado com ${levelScore} pontos!`);
    
    // Save progress to database
    await saveLevelProgress(currentLevel, levelScore);
    
    // Update total score
    setScore(prev => prev + levelScore);
  };

  const handleAdvanceLevel = () => {
    if (currentLevel < 20) {
      setCurrentLevel(prev => prev + 1);
      setTimeRemaining(180); // Reset time for new level
      setCurrentLevelScore(0); // Reset level score
      console.log(`Avançando para o nível ${currentLevel + 1}`);
    } else {
      console.log('Desafio completado! Todos os níveis foram concluídos.');
      onBack(); // Return to home if all levels completed
    }
  };

  const handleTimeUp = () => {
    console.log('Tempo esgotado!');
  };

  // Always restart from level 1 when going back
  const handleBackToHome = () => {
    setCurrentLevel(1);
    setScore(0);
    setCurrentLevelScore(0);
    setTimeRemaining(180);
    setIsGameStarted(false);
    setShowInstructions(true);
    onBack();
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <ChallengeHeader onBack={handleBackToHome} theme={challengeData.theme} />
        
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
        onBack={handleBackToHome}
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
          onLevelComplete={handleLevelComplete}
          onAdvanceLevel={handleAdvanceLevel}
        />
      </div>
    </div>
  );
};

export default ChallengeScreen;
