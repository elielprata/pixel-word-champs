
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./components/auth/AuthProvider";
import AdminRoute from "./components/auth/AdminRoute";
import { useAuth } from "./hooks/useAuth";
import AuthScreen from "./components/auth/AuthScreen";
import Index from "./pages/Index";
import AdminPanel from "./pages/AdminPanel";
import DailyCompetitionRanking from "./pages/DailyCompetitionRanking";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente interno que tem acesso ao contexto de auth
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('AuthState:', { isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      
      {/* Rotas protegidas */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Index /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/admin" 
        element={
          isAuthenticated ? (
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/admin/daily-competition/:competitionId/ranking" 
        element={
          isAuthenticated ? (
            <AdminRoute>
              <DailyCompetitionRanking />
            </AdminRoute>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      
      {/* Rota de autenticação */}
      <Route 
        path="/auth" 
        element={!isAuthenticated ? <AuthScreen /> : <Navigate to="/" replace />} 
      />
      
      {/* Rota catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
        <Sonner />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
