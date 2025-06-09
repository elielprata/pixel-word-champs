
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import Index from './pages/Index';
import AdminPanel from './pages/AdminPanel';
import DailyCompetitionRanking from './pages/DailyCompetitionRanking';
import WeeklyCompetitionRanking from './pages/WeeklyCompetitionRanking';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AuthScreen from '@/components/auth/AuthScreen';
import AuthProvider from '@/components/auth/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthScreen />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/competition/:competitionId/ranking" element={<DailyCompetitionRanking />} />
              <Route path="/admin/weekly-competition/:competitionId/ranking" element={<WeeklyCompetitionRanking />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
