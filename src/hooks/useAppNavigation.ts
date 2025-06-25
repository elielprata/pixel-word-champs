
import { useState } from 'react';

export type Screen = 
  | 'home'
  | 'ranking' 
  | 'profile'
  | 'settings'
  | 'help'
  | 'terms'
  | 'privacy'
  | 'language'
  | 'deleteAccount'
  | 'game'
  | 'challenge'
  | 'fullRanking'
  | 'challengeRanking'
  | 'achievements'
  | 'invite'
  | 'pixConfig'
  | 'gameRules'
  | 'admin';

export const useAppNavigation = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const goBack = () => {
    // Simple back navigation - in a real app you might want a more sophisticated history
    if (currentScreen !== 'home') {
      setCurrentScreen('home');
    }
  };

  return {
    currentScreen,
    navigateToScreen,
    goBack
  };
};
