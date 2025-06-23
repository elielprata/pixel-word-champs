
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Toaster } from "@/components/ui/toaster";
import Index from '@/pages/Index';
import AdminPanel from '@/pages/AdminPanel';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import WeeklyCompetitionRanking from '@/pages/WeeklyCompetitionRanking';
import NotFound from '@/pages/NotFound';
import { logger } from '@/utils/logger';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

logger.info('Aplicação iniciada', undefined, 'APP');

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/weekly-ranking" element={<WeeklyCompetitionRanking />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
