
import React from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import HomeScreen from '@/components/HomeScreen';
import RankingScreen from '@/components/RankingScreen';
import InviteScreen from '@/components/InviteScreen';
import ProfileScreen from '@/components/ProfileScreen';
import FullRankingScreen from '@/components/FullRankingScreen';
import ChallengeRankingScreen from '@/components/ChallengeRankingScreen';
import SettingsScreen from '@/components/SettingsScreen';
import HelpSupportScreen from '@/components/HelpSupportScreen';
import AchievementsScreen from '@/components/AchievementsScreen';
import { useAppNavigation } from '@/hooks/useAppNavigation';

const Index = () => {
  const {
    navigationState,
    setActiveTab,
    handleStartChallenge,
    handleBackToHome,
    handleViewFullRanking,
    handleBackFromFullRanking,
    handleViewChallengeRanking,
    handleBackFromChallengeRanking,
    handleNavigateToSettings,
    handleBackFromSettings,
    handleNavigateToHelp,
    handleBackFromHelp,
    handleNavigateToAchievements,
    handleBackFromAchievements,
  } = useAppNavigation();

  const {
    activeTab,
    showFullRanking,
    challengeRankingId,
    showSettings,
    showHelp,
    showAchievements
  } = navigationState;

  if (showFullRanking) {
    return (
      <FullRankingScreen onBack={handleBackFromFullRanking} />
    );
  }

  if (challengeRankingId) {
    return (
      <ChallengeRankingScreen 
        challengeId={challengeRankingId}
        onBack={handleBackFromChallengeRanking} 
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
            onStartChallenge={handleStartChallenge} 
            onViewFullRanking={handleViewFullRanking}
            onViewChallengeRanking={handleViewChallengeRanking}
          />
        );
      case 'ranking':
        return <RankingScreen />;
      case 'invite':
        return <InviteScreen />;
      case 'profile':
        return (
          <ProfileScreen 
            onNavigateToSettings={handleNavigateToSettings}
            onNavigateToHelp={handleNavigateToHelp}
            onNavigateToAchievements={handleNavigateToAchievements}
          />
        );
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
    <div className="min-h-screen bg-gray-50">
      {renderScreen()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
