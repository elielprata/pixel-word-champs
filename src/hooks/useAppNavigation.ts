
import { useState } from 'react';

export interface NavigationState {
  activeTab: string;
  activeChallenge: string | null;
  showFullRanking: boolean;
  challengeRankingId: number | null;
  showSettings: boolean;
  showHelp: boolean;
  showAchievements: boolean;
  showGameRules: boolean;
  pendingChallengeId: string | null;
}

export const useAppNavigation = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    activeTab: 'home',
    activeChallenge: null,
    showFullRanking: false,
    challengeRankingId: null,
    showSettings: false,
    showHelp: false,
    showAchievements: false,
    showGameRules: false,
    pendingChallengeId: null,
  });

  const setActiveTab = (tab: string) => {
    setNavigationState(prev => ({ ...prev, activeTab: tab }));
  };

  const handleStartChallenge = (challengeId: string) => {
    setNavigationState(prev => ({ 
      ...prev, 
      showGameRules: true,
      pendingChallengeId: challengeId,
      activeTab: 'home'
    }));
  };

  const handleStartGameFromRules = () => {
    setNavigationState(prev => ({
      ...prev,
      showGameRules: false,
      activeChallenge: prev.pendingChallengeId,
      pendingChallengeId: null
    }));
  };

  const handleBackFromRules = () => {
    setNavigationState(prev => ({
      ...prev,
      showGameRules: false,
      pendingChallengeId: null
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

  const handleNavigateToAchievements = () => {
    setNavigationState(prev => ({ ...prev, showAchievements: true }));
  };

  const handleBackFromAchievements = () => {
    setNavigationState(prev => ({ ...prev, showAchievements: false }));
  };

  return {
    navigationState,
    setActiveTab,
    handleStartChallenge,
    handleStartGameFromRules,
    handleBackFromRules,
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
  };
};
