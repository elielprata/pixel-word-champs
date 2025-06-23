
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import BottomNavigation from '@/components/BottomNavigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import HomeScreen from '@/components/HomeScreen';
import RankingScreen from '@/components/RankingScreen';
import ProfileScreen from '@/components/ProfileScreen';
import ChallengeScreen from '@/components/ChallengeScreen';
import GameBoard from '@/components/GameBoard';
import { LazyAdminPanel as AdminPanel } from '@/components/admin/LazyAdminPanel';
import RobustAdminRoute from '@/components/auth/RobustAdminRoute';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { logger } from '@/utils/logger';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

type Screen = 'home' | 'ranking' | 'profile' | 'challenge' | 'game' | 'admin';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  logger.debug('Index renderizado', { currentScreen, selectedChallengeId }, 'INDEX');

  const handleChallengeSelect = (challengeId: string) => {
    logger.info('Challenge selecionado', { challengeId }, 'INDEX');
    setSelectedChallengeId(challengeId);
    setCurrentScreen('challenge');
  };

  const handleStartGame = (challengeId: string) => {
    logger.info('Iniciando jogo', { challengeId }, 'INDEX');
    setSelectedChallengeId(challengeId);
    setCurrentScreen('game');
  };

  const handleBackToHome = () => {
    logger.debug('Voltando para home', undefined, 'INDEX');
    setCurrentScreen('home');
    setSelectedChallengeId(null);
  };

  const handleBackToChallenge = () => {
    logger.debug('Voltando para challenge', undefined, 'INDEX');
    setCurrentScreen('challenge');
  };

  const handleNavigateToAdmin = () => {
    logger.info('Navegando para admin', undefined, 'INDEX');
    setCurrentScreen('admin');
  };

  const handleBottomNavigation = (screen: 'home' | 'ranking' | 'fullRanking' | 'profile' | 'settings' | 'invite' | 'achievements') => {
    logger.debug('Mudança de tela via navegação', { from: currentScreen, to: screen }, 'INDEX');
    
    // Map BottomNavigation screens to our Screen type
    switch (screen) {
      case 'home':
        setCurrentScreen('home');
        break;
      case 'ranking':
        setCurrentScreen('ranking');
        break;
      case 'profile':
        setCurrentScreen('profile');
        break;
      default:
        // For other screens not in our main navigation, stay on current screen
        break;
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onChallengeSelect={handleChallengeSelect}
            onNavigateToAdmin={handleNavigateToAdmin}
          />
        );
      case 'ranking':
        return <RankingScreen onBack={handleBackToHome} />;
      case 'profile':
        return <ProfileScreen onBack={handleBackToHome} />;
      case 'challenge':
        return (
          <ChallengeScreen 
            challengeId={selectedChallengeId || ''}
            onBack={handleBackToHome}
            onStartGame={handleStartGame}
          />
        );
      case 'game':
        return (
          <GameBoard 
            challengeId={selectedChallengeId || ''}
            onBack={handleBackToChallenge}
            onComplete={handleBackToHome}
          />
        );
      case 'admin':
        return (
          <RobustAdminRoute>
            <AdminPanel onBack={handleBackToHome} />
          </RobustAdminRoute>
        );
      default:
        return (
          <HomeScreen 
            onChallengeSelect={handleChallengeSelect}
            onNavigateToAdmin={handleNavigateToAdmin}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50">
            {renderCurrentScreen()}
            
            {currentScreen !== 'admin' && currentScreen !== 'game' && (
              <BottomNavigation 
                currentScreen={currentScreen === 'challenge' ? 'home' : currentScreen as 'home' | 'ranking' | 'profile'}
                onScreenChange={handleBottomNavigation}
              />
            )}
          </div>
          <Toaster />
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default Index;
