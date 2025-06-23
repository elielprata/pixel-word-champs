
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from './pages/Index';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AuthScreen from '@/components/auth/AuthScreen';
import { SimpleAuthProvider } from '@/components/auth/SimpleAuthProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import { logger } from '@/utils/logger';
import { initializeCacheWarming } from '@/utils/cacheWarming';

function App() {
  logger.debug('Aplicação inicializada', undefined, 'APP');

  // Inicializar cache warming automático
  useEffect(() => {
    try {
      initializeCacheWarming();
      logger.info('✅ Cache warming automático inicializado', undefined, 'APP');
    } catch (error) {
      logger.error('❌ Erro ao inicializar cache warming', { error }, 'APP');
    }
  }, []);

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <SimpleAuthProvider>
          <div className="App">
            <Routes>
              <Route path="/auth" element={<AuthScreen />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </SimpleAuthProvider>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
