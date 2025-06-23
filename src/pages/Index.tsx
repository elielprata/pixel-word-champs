
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthScreen from '@/components/auth/AuthScreen';
import HomeScreen from '@/components/HomeScreen';
import ProfileScreen from '@/components/ProfileScreen';
import ChallengeScreen from '@/components/ChallengeScreen';
import RankingScreen from '@/components/RankingScreen';
import SettingsScreen from '@/components/SettingsScreen';
import BottomNavigation from '@/components/BottomNavigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { logger } from '@/utils/logger';

type Screen = 'home' | 'challenge' | 'ranking' | 'profile' | 'settings';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  useEffect(() => {
    logger.debug('Index montado', { isAuthenticated, isLoading }, 'INDEX');
  }, [isAuthenticated, isLoading]);

  const handleScreenChange = (screen: Screen) => {
    logger.debug('Mudança de tela', { from: currentScreen, to: screen }, 'INDEX');
    setCurrentScreen(screen);
  };

  const handleBackToHome = () => {
    logger.debug('Voltando para home', undefined, 'INDEX');
    setCurrentScreen('home');
    setSelectedChallengeId(null);
  };

  const handleStartChallenge = (challengeId: string) => {
    logger.debug('Iniciando desafio', { challengeId }, 'INDEX');
    setSelectedChallengeId(challengeId);
    setCurrentScreen('challenge');
  };

  const handleViewFullRanking = () => {
    logger.debug('Visualizando ranking completo', undefined, 'INDEX');
    setCurrentScreen('ranking');
  };

  const handleViewChallengeRanking = (challengeId: string) => {
    logger.debug('Visualizando ranking do desafio', { challengeId }, 'INDEX');
    setCurrentScreen('ranking');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onStartChallenge={handleStartChallenge}
            onViewFullRanking={handleViewFullRanking}
            onViewChallengeRanking={handleViewChallengeRanking}
          />
        );
      case 'challenge':
        if (!selectedChallengeId) {
          return (
            <HomeScreen 
              onStartChallenge={handleStartChallenge}
              onViewFullRanking={handleViewFullRanking}
              onViewChallengeRanking={handleViewChallengeRanking}
            />
          );
        }
        return (
          <ChallengeScreen 
            challengeId={selectedChallengeId}
            onBack={handleBackToHome} 
          />
        );
      case 'ranking':
        return <RankingScreen onBack={handleBackToHome} />;
      case 'profile':
        return <ProfileScreen onBack={handleBackToHome} />;
      case 'settings':
        return <SettingsScreen onBack={handleBackToHome} />;
      default:
        return (
          <HomeScreen 
            onStartChallenge={handleStartChallenge}
            onViewFullRanking={handleViewFullRanking}
            onViewChallengeRanking={handleViewChallengeRanking}
          />
        );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
        {renderScreen()}
        <BottomNavigation 
          currentScreen={currentScreen} 
          onScreenChange={handleScreenChange} 
        />
      </div>
    </ProtectedRoute>
  );
};

export default Index;
