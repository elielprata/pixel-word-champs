
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
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
  
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

  // Check if this challenge has been completed (user chose to stop)
  const isChallengeCompleted = completedChallenges.has(challengeId);

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
    
    // The modal will show and wait for user action
    // Points will be added when user advances to next level
  };

  const handleAdvanceLevel = () => {
    // Add current level score to total score
    setScore(prev => prev + currentLevelScore);
    
    if (currentLevel < 20) {
      setCurrentLevel(prev => prev + 1);
      setTimeRemaining(180); // Reset time for new level
      setCurrentLevelScore(0); // Reset level score
      console.log(`Avançando para o nível ${currentLevel + 1}`);
    } else {
      console.log('Desafio completado! Todos os níveis foram concluídos.');
      handleStopGame();
    }
  };

  const handleStopGame = () => {
    // Mark this challenge as completed (user chose to stop)
    setCompletedChallenges(prev => new Set(prev).add(challengeId));
    console.log(`Usuário parou no desafio ${challengeId}`);
    handleBackToHome();
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

  // If challenge is completed, don't show it
  if (isChallengeCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Desafio Concluído</h2>
          <p className="text-gray-600 mb-6">Você já completou este desafio.</p>
          <button 
            onClick={handleBackToHome}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

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
          onStopGame={handleStopGame}
        />
      </div>
    </div>
  );
};

export default ChallengeScreen;
