
import React, { useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import HomeScreen from '@/components/HomeScreen';
import RankingScreen from '@/components/RankingScreen';
import InviteScreen from '@/components/InviteScreen';
import ProfileScreen from '@/components/ProfileScreen';
import ChallengeScreen from '@/components/ChallengeScreen';
import FullRankingScreen from '@/components/FullRankingScreen';
import ChallengeRankingScreen from '@/components/ChallengeRankingScreen';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeChallenge, setActiveChallenge] = useState<number | null>(null);
  const [showFullRanking, setShowFullRanking] = useState(false);
  const [challengeRankingId, setChallengeRankingId] = useState<number | null>(null);

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
        return <ProfileScreen />;
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
