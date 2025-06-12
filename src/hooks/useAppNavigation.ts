
import { useState } from 'react';
import { logger } from '@/utils/logger';

interface NavigationState {
  activeTab: string;
  activeChallenge: string | number | null;
  showFullRanking: boolean;
  challengeRankingId: string | null;
  showSettings: boolean;
  showHelp: boolean;
  showAchievements: boolean;
  showGameRules: boolean;
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
  });

  const setActiveTab = (tab: string) => {
    logger.debug('Mudança de aba', { from: navigationState.activeTab, to: tab }, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      activeTab: tab,
      showFullRanking: false,
      challengeRankingId: null,
      showSettings: false,
      showHelp: false,
      showAchievements: false,
      showGameRules: false,
    }));
  };

  const handleStartChallenge = (challengeId: string | number) => {
    logger.info('Iniciando desafio via navegação', { challengeId: String(challengeId) }, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      activeChallenge: challengeId,
      showGameRules: false,
    }));
  };

  const handleStartGameFromRules = () => {
    logger.debug('Iniciando jogo das regras', undefined, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      showGameRules: false,
      activeChallenge: 'daily',
    }));
  };

  const handleBackFromRules = () => {
    logger.debug('Voltando das regras do jogo', undefined, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      showGameRules: false,
    }));
  };

  const handleBackToHome = () => {
    logger.debug('Voltando para home', undefined, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      activeChallenge: null,
      showFullRanking: false,
      challengeRankingId: null,
      showSettings: false,
      showHelp: false,
      showAchievements: false,
      showGameRules: false,
    }));
  };

  const handleViewFullRanking = () => {
    logger.debug('Visualizando ranking completo', undefined, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      showFullRanking: true,
    }));
  };

  const handleBackFromFullRanking = () => {
    logger.debug('Voltando do ranking completo', undefined, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      showFullRanking: false,
    }));
  };

  const handleViewChallengeRanking = (challengeId: string) => {
    logger.debug('Visualizando ranking do desafio', { challengeId }, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      challengeRankingId: challengeId,
    }));
  };

  const handleBackFromChallengeRanking = () => {
    logger.debug('Voltando do ranking do desafio', undefined, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      challengeRankingId: null,
    }));
  };

  const handleNavigateToSettings = () => {
    logger.debug('Navegando para configurações', undefined, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      showSettings: true,
    }));
  };

  const handleBackFromSettings = () => {
    logger.debug('Voltando das configurações', undefined, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      showSettings: false,
    }));
  };

  const handleNavigateToHelp = () => {
    logger.debug('Navegando para ajuda', undefined, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      showHelp: true,
    }));
  };

  const handleBackFromHelp = () => {
    logger.debug('Voltando da ajuda', undefined, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      showHelp: false,
    }));
  };

  const handleNavigateToAchievements = () => {
    logger.debug('Navegando para conquistas', undefined, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      showAchievements: true,
    }));
  };

  const handleBackFromAchievements = () => {
    logger.debug('Voltando das conquistas', undefined, 'APP_NAVIGATION');
    setNavigationState(prev => ({ 
      ...prev, 
      showAchievements: false,
    }));
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
