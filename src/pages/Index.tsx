
import React from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import HomeScreen from '@/components/HomeScreen';
import RankingScreen from '@/components/RankingScreen';
import InviteScreen from '@/components/InviteScreen';
import ProfileScreen from '@/components/ProfileScreen';
import FullRankingScreen from '@/components/FullRankingScreen';
import DailyCompetitionRankingScreen from '@/components/DailyCompetitionRankingScreen';
import DailyCompetitionScreen from '@/components/DailyCompetitionScreen';
import SettingsScreen from '@/components/SettingsScreen';
import HelpSupportScreen from '@/components/HelpSupportScreen';
import AchievementsScreen from '@/components/AchievementsScreen';
import GameRulesScreen from '@/components/GameRulesScreen';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { logger } from '@/utils/logger';

const Index = () => {
  const {
    navigationState,
    setActiveTab,
    handleStartDailyCompetition,
    handleStartGameFromRules,
    handleBackFromRules,
    handleBackToHome,
    handleViewFullRanking,
    handleBackFromFullRanking,
    handleViewDailyCompetitionRanking,
    handleBackFromDailyCompetitionRanking,
    handleNavigateToSettings,
    handleBackFromSettings,
    handleNavigateToHelp,
    handleBackFromHelp,
    handleNavigateToAchievements,
    handleBackFromAchievements,
  } = useAppNavigation();

  const {
    activeTab,
    activeDailyCompetition,
    showFullRanking,
    dailyCompetitionRankingId,
    showSettings,
    showHelp,
    showAchievements,
    showGameRules
  } = navigationState;

  logger.debug('Renderizando página principal', { 
    activeTab, 
    activeDailyCompetition, 
    showFullRanking 
  }, 'INDEX_PAGE');

  // Se há uma competição diária ativa, mostrar a tela do jogo
  if (activeDailyCompetition) {
    return (
      <DailyCompetitionScreen 
        competitionId={activeDailyCompetition}
        onBack={handleBackToHome}
      />
    );
  }

  if (showGameRules) {
    return (
      <GameRulesScreen 
        onBack={handleBackFromRules}
        onStartGame={handleStartGameFromRules}
      />
    );
  }

  if (showFullRanking) {
    return (
      <FullRankingScreen onBack={handleBackFromFullRanking} />
    );
  }

  if (dailyCompetitionRankingId) {
    return (
      <DailyCompetitionRankingScreen 
        competitionId={dailyCompetitionRankingId}
        onBack={handleBackFromDailyCompetitionRanking} 
      />
    );
  }

  if (showSettings) {
    return (
      <SettingsScreen onBack={handleBackFromSettings} />
    );
  }

  if (showHelp) {
    return (
      <HelpSupportScreen onBack={handleBackFromHelp} />
    );
  }

  if (showAchievements) {
    return (
      <AchievementsScreen onBack={handleBackFromAchievements} />
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen 
            onStartChallenge={handleStartDailyCompetition} 
            onViewFullRanking={handleViewFullRanking}
            onViewChallengeRanking={handleViewDailyCompetitionRanking}
          />
        );
      case 'ranking':
        return <RankingScreen onBack={() => setActiveTab('home')} />;
      case 'invite':
        return <InviteScreen onBack={() => setActiveTab('home')} />;
      case 'profile':
        return (
          <ProfileScreen 
            onBack={() => setActiveTab('home')}
          />
        );
      default:
        return (
          <HomeScreen 
            onStartChallenge={handleStartDailyCompetition} 
            onViewFullRanking={handleViewFullRanking}
            onViewChallengeRanking={handleViewDailyCompetitionRanking}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderScreen()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
