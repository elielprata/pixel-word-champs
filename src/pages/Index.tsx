
import React from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import HomeScreen from '@/components/HomeScreen';
import RankingScreen from '@/components/RankingScreen';
import InviteScreen from '@/components/InviteScreen';
import ProfileScreen from '@/components/ProfileScreen';
import ChallengeScreen from '@/components/ChallengeScreen';
import FullRankingScreen from '@/components/FullRankingScreen';
import ChallengeRankingScreen from '@/components/ChallengeRankingScreen';
import SettingsScreen from '@/components/SettingsScreen';
import HelpSupportScreen from '@/components/HelpSupportScreen';
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
  } = useAppNavigation();

  const {
    activeTab,
    activeChallenge,
    showFullRanking,
    challengeRankingId,
    showSettings,
    showHelp
  } = navigationState;

  if (activeChallenge) {
    return (
      <ChallengeScreen 
        challengeId={activeChallenge} 
        onBack={handleBackToHome}
      />
    );
  }

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
