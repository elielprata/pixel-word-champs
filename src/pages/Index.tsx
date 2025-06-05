
import React, { useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import HomeScreen from '@/components/HomeScreen';
import RankingScreen from '@/components/RankingScreen';
import InviteScreen from '@/components/InviteScreen';
import ProfileScreen from '@/components/ProfileScreen';
import ChallengeScreen from '@/components/ChallengeScreen';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeChallenge, setActiveChallenge] = useState<number | null>(null);

  const handleStartChallenge = (challengeId: number) => {
    setActiveChallenge(challengeId);
  };

  const handleBackToHome = () => {
    setActiveChallenge(null);
    setActiveTab('home');
  };

  if (activeChallenge) {
    return (
      <ChallengeScreen 
        challengeId={activeChallenge} 
        onBack={handleBackToHome}
      />
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onStartChallenge={handleStartChallenge} />;
      case 'ranking':
        return <RankingScreen />;
      case 'invite':
        return <InviteScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen onStartChallenge={handleStartChallenge} />;
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
