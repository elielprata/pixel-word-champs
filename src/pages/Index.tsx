
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import HomeScreen from '@/components/HomeScreen';
import ChallengeScreen from '@/components/ChallengeScreen';
import RankingScreen from '@/components/RankingScreen';
import FullRankingScreen from '@/components/FullRankingScreen';
import ProfileScreen from '@/components/ProfileScreen';
import SettingsScreen from '@/components/SettingsScreen';
import InviteScreen from '@/components/InviteScreen';
import AchievementsScreen from '@/components/AchievementsScreen';
import BottomNavigation from '@/components/BottomNavigation';
import AuthScreen from '@/components/auth/AuthScreen';
import ProtectedRoute from '@/components/ProtectedRoute';
import { logger } from '@/utils/logger';

type Screen = 'home' | 'challenge' | 'ranking' | 'fullRanking' | 'profile' | 'settings' | 'invite' | 'achievements';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [challengeId, setChallengeId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const handleStartChallenge = (id: string) => {
    logger.info('Iniciando desafio', { challengeId: id }, 'INDEX_NAVIGATION');
    setChallengeId(id);
    setCurrentScreen('challenge');
  };

  const handleViewFullRanking = () => {
    logger.info('Navegando para ranking completo', undefined, 'INDEX_NAVIGATION');
    setCurrentScreen('fullRanking');
  };

  const handleViewChallengeRanking = (challengeId: number) => {
    logger.info('Visualizando ranking do desafio', { challengeId }, 'INDEX_NAVIGATION');
    // Implementar navegação para ranking do desafio específico
  };

  const handleBackToHome = () => {
    logger.info('Voltando para a tela inicial', { previousScreen: currentScreen }, 'INDEX_NAVIGATION');
    setCurrentScreen('home');
    setChallengeId(null);
  };

  const renderCurrentScreen = () => {
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
        return challengeId ? (
          <ChallengeScreen
            challengeId={challengeId}
            onBack={handleBackToHome}
          />
        ) : null;
      case 'ranking':
        return <RankingScreen onBack={handleBackToHome} />;
      case 'fullRanking':
        return <FullRankingScreen onBack={handleBackToHome} />;
      case 'profile':
        return <ProfileScreen onBack={handleBackToHome} />;
      case 'settings':
        return <SettingsScreen onBack={handleBackToHome} />;
      case 'invite':
        return <InviteScreen onBack={handleBackToHome} />;
      case 'achievements':
        return <AchievementsScreen onBack={handleBackToHome} />;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        {renderCurrentScreen()}
        {currentScreen !== 'challenge' && (
          <BottomNavigation
            currentScreen={currentScreen}
            onScreenChange={setCurrentScreen}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Index;
