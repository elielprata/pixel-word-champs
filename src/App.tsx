
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/auth/AdminRoute';
import AuthScreen from '@/components/auth/AuthScreen';
import ErrorBoundary from '@/components/ErrorBoundary';
import BottomNavigation from '@/components/BottomNavigation';
import HomeScreen from '@/components/HomeScreen';
import ChallengeScreen from '@/components/ChallengeScreen';
import FullRankingScreen from '@/components/FullRankingScreen';
import ProfileScreen from '@/components/ProfileScreen';
import InviteScreen from '@/components/InviteScreen';
import AdminPanel from '@/pages/AdminPanel';
import NotFound from '@/pages/NotFound';
import './App.css';

type Screen = 'home' | 'challenge' | 'ranking' | 'profile' | 'invite' | 'challenge-ranking';

interface AppProps {}

const queryClient = new QueryClient();

function App({}: AppProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [challengeCategory, setChallengeCategory] = useState<string | undefined>(undefined);
  const [challengeRankingId, setChallengeRankingId] = useState<number | null>(null);

  const handleStartChallenge = (id: string, category?: string) => {
    console.log(`🎯 App - Iniciando challenge ${id} com categoria: ${category || 'sem categoria'}`);
    setChallengeId(id);
    setChallengeCategory(category);
    setCurrentScreen('challenge');
  };

  const handleBackFromChallenge = () => {
    setChallengeId(null);
    setChallengeCategory(undefined);
    setCurrentScreen('home');
  };

  const handleViewFullRanking = () => {
    setCurrentScreen('ranking');
  };

  const handleViewChallengeRanking = (id: number) => {
    setChallengeRankingId(id);
    setCurrentScreen('challenge-ranking');
  };

  const handleBackFromRanking = () => {
    setCurrentScreen('home');
  };

  const handleGoToProfile = () => {
    setCurrentScreen('profile');
  };

  const handleGoToInvite = () => {
    setCurrentScreen('invite');
  };

  const handleTabChange = (tab: string) => {
    setCurrentScreen(tab as Screen);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onStartChallenge={handleStartChallenge}
            onViewFullRanking={handleViewFullRanking}
            onViewChallengeRanking={handleViewChallengeRanking}
          />
        );
      case 'challenge':
        return challengeId ? (
          <ChallengeScreen
            challengeId={challengeId}
            category={challengeCategory}
            onBack={handleBackFromChallenge}
          />
        ) : null;
      case 'ranking':
        return <FullRankingScreen onBack={handleBackFromRanking} />;
      case 'profile':
        return <ProfileScreen />;
      case 'invite':
        return <InviteScreen />;
      case 'challenge-ranking':
        return challengeRankingId ? <div>Ranking da Competição {challengeRankingId}</div> : null;
      default:
        return <HomeScreen onStartChallenge={handleStartChallenge} onViewFullRanking={handleViewFullRanking} onViewChallengeRanking={handleViewChallengeRanking} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AuthProvider>
            <Router>
              <div className="App min-h-screen bg-gray-50">
                <Routes>
                  <Route path="/auth" element={<AuthScreen />} />
                  <Route path="/admin/*" element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  } />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <div className="pb-16">
                        {renderCurrentScreen()}
                      </div>
                      <BottomNavigation 
                        activeTab={currentScreen} 
                        onTabChange={handleTabChange} 
                      />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </AuthProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
