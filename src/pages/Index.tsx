
import React, { useState } from 'react';
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

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeChallenge, setActiveChallenge] = useState<number | null>(null);
  const [showFullRanking, setShowFullRanking] = useState(false);
  const [challengeRankingId, setChallengeRankingId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleStartChallenge = (challengeId: number) => {
    setActiveChallenge(challengeId);
  };

  const handleBackToHome = () => {
    setActiveChallenge(null);
    setActiveTab('home');
  };

  const handleViewFullRanking = () => {
    setShowFullRanking(true);
  };

  const handleBackFromFullRanking = () => {
    setShowFullRanking(false);
  };

  const handleViewChallengeRanking = (challengeId: number) => {
    setChallengeRankingId(challengeId);
  };

  const handleBackFromChallengeRanking = () => {
    setChallengeRankingId(null);
  };

  const handleNavigateToSettings = () => {
    setShowSettings(true);
  };

  const handleBackFromSettings = () => {
    setShowSettings(false);
  };

  const handleNavigateToHelp = () => {
    setShowHelp(true);
  };

  const handleBackFromHelp = () => {
    setShowHelp(false);
  };

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
