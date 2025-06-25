
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import HomeScreen from '@/components/HomeScreen';
import RankingScreen from '@/components/RankingScreen';
import ProfileScreen from '@/components/ProfileScreen';
import SettingsScreen from '@/components/SettingsScreen';
import HelpScreen from '@/components/HelpScreen';
import TermsOfServiceScreen from '@/components/TermsOfServiceScreen';
import PrivacyPolicyScreen from '@/components/PrivacyPolicyScreen';
import LanguageSelectionScreen from '@/components/LanguageSelectionScreen';
import DeleteAccountScreen from '@/components/DeleteAccountScreen';
import GameBoard from '@/components/GameBoard';
import ChallengeScreen from '@/components/ChallengeScreen';
import FullRankingScreen from '@/components/FullRankingScreen';
import ChallengeRankingScreen from '@/components/ChallengeRankingScreen';
import AchievementsScreen from '@/components/AchievementsScreen';
import InviteScreen from '@/components/InviteScreen';
import PixConfigScreen from '@/components/PixConfigScreen';
import GameRulesScreen from '@/components/GameRulesScreen';
import AdminPanel from '@/pages/AdminPanel';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const { currentScreen, navigateToScreen } = useAppNavigation();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={navigateToScreen} />;
      case 'ranking':
        return <RankingScreen onBack={() => navigateToScreen('home')} />;
      case 'profile':
        return <ProfileScreen onBack={() => navigateToScreen('home')} />;
      case 'settings':
        return <SettingsScreen onBack={() => navigateToScreen('home')} />;
      case 'help':
        return <HelpScreen onBack={() => navigateToScreen('settings')} />;
      case 'terms':
        return <TermsOfServiceScreen onBack={() => navigateToScreen('settings')} />;
      case 'privacy':
        return <PrivacyPolicyScreen onBack={() => navigateToScreen('settings')} />;
      case 'language':
        return <LanguageSelectionScreen onBack={() => navigateToScreen('settings')} />;
      case 'deleteAccount':
        return <DeleteAccountScreen onBack={() => navigateToScreen('settings')} />;
      case 'game':
        return <GameBoard onBack={() => navigateToScreen('home')} />;
      case 'challenge':
        return <ChallengeScreen onBack={() => navigateToScreen('home')} />;
      case 'fullRanking':
        return <FullRankingScreen onBack={() => navigateToScreen('ranking')} />;
      case 'challengeRanking':
        return <ChallengeRankingScreen onBack={() => navigateToScreen('home')} />;
      case 'achievements':
        return <AchievementsScreen onBack={() => navigateToScreen('profile')} />;
      case 'invite':
        return <InviteScreen onBack={() => navigateToScreen('profile')} />;
      case 'pixConfig':
        return <PixConfigScreen onBack={() => navigateToScreen('profile')} />;
      case 'gameRules':
        return <GameRulesScreen onBack={() => navigateToScreen('help')} />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <HomeScreen onNavigate={navigateToScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {renderScreen()}
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        </AuthProvider>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
