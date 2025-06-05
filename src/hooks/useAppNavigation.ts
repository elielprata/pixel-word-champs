
import { useState } from 'react';

export interface NavigationState {
  activeTab: string;
  activeChallenge: number | null;
  showFullRanking: boolean;
  challengeRankingId: number | null;
  showSettings: boolean;
  showHelp: boolean;
}

export const useAppNavigation = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    activeTab: 'home',
    activeChallenge: null,
    showFullRanking: false,
    challengeRankingId: null,
    showSettings: false,
    showHelp: false,
  });

  const setActiveTab = (tab: string) => {
    setNavigationState(prev => ({ ...prev, activeTab: tab }));
  };

  const handleStartChallenge = (challengeId: number) => {
    setNavigationState(prev => ({ 
      ...prev, 
      activeChallenge: challengeId,
      activeTab: 'home'
    }));
  };

  const handleBackToHome = () => {
    setNavigationState(prev => ({
      ...prev,
      activeChallenge: null,
      activeTab: 'home'
    }));
  };

  const handleViewFullRanking = () => {
    setNavigationState(prev => ({ ...prev, showFullRanking: true }));
  };

  const handleBackFromFullRanking = () => {
    setNavigationState(prev => ({ ...prev, showFullRanking: false }));
  };

  const handleViewChallengeRanking = (challengeId: number) => {
    setNavigationState(prev => ({ ...prev, challengeRankingId: challengeId }));
  };

  const handleBackFromChallengeRanking = () => {
    setNavigationState(prev => ({ ...prev, challengeRankingId: null }));
  };

  const handleNavigateToSettings = () => {
    setNavigationState(prev => ({ ...prev, showSettings: true }));
  };

  const handleBackFromSettings = () => {
    setNavigationState(prev => ({ ...prev, showSettings: false }));
  };

  const handleNavigateToHelp = () => {
    setNavigationState(prev => ({ ...prev, showHelp: true }));
  };

  const handleBackFromHelp = () => {
    setNavigationState(prev => ({ ...prev, showHelp: false }));
  };

  return {
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
  };
};
