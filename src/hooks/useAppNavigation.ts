
import { useState } from 'react';

export interface NavigationState {
  activeTab: string;
  activeDailyCompetition: string | null;
  showFullRanking: boolean;
  dailyCompetitionRankingId: number | null;
  showSettings: boolean;
  showHelp: boolean;
  showAchievements: boolean;
  showGameRules: boolean;
  pendingCompetitionId: string | null;
}

export const useAppNavigation = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    activeTab: 'home',
    activeDailyCompetition: null,
    showFullRanking: false,
    dailyCompetitionRankingId: null,
    showSettings: false,
    showHelp: false,
    showAchievements: false,
    showGameRules: false,
    pendingCompetitionId: null,
  });

  const setActiveTab = (tab: string) => {
    setNavigationState(prev => ({ ...prev, activeTab: tab }));
  };

  const handleStartDailyCompetition = (competitionId: string) => {
    setNavigationState(prev => ({ 
      ...prev, 
      showGameRules: true,
      pendingCompetitionId: competitionId,
      activeTab: 'home'
    }));
  };

  const handleStartGameFromRules = () => {
    setNavigationState(prev => ({
      ...prev,
      showGameRules: false,
      activeDailyCompetition: prev.pendingCompetitionId,
      pendingCompetitionId: null
    }));
  };

  const handleBackFromRules = () => {
    setNavigationState(prev => ({
      ...prev,
      showGameRules: false,
      pendingCompetitionId: null
    }));
  };

  const handleBackToHome = () => {
    setNavigationState(prev => ({
      ...prev,
      activeDailyCompetition: null,
      activeTab: 'home'
    }));
  };

  const handleViewFullRanking = () => {
    setNavigationState(prev => ({ ...prev, showFullRanking: true }));
  };

  const handleBackFromFullRanking = () => {
    setNavigationState(prev => ({ ...prev, showFullRanking: false }));
  };

  const handleViewDailyCompetitionRanking = (competitionId: number) => {
    setNavigationState(prev => ({ ...prev, dailyCompetitionRankingId: competitionId }));
  };

  const handleBackFromDailyCompetitionRanking = () => {
    setNavigationState(prev => ({ ...prev, dailyCompetitionRankingId: null }));
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
  };
};
