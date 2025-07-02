
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthLoadingState } from '@/hooks/useAuthLoadingState';
import { logger } from '@/utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { shouldShowLoading, loadingMessage } = useAuthLoadingState(isLoading, isAuthenticated);

  logger.debug('🛡️ ProtectedRoute verificação', { 
    isAuthenticated, 
    isLoading,
    shouldShowLoading
  }, 'PROTECTED_ROUTE');

  // Mostrar loading enquanto verifica autenticação
  if (shouldShowLoading) {
    logger.debug('🔄 Mostrando loading de autenticação', { 
      isAuthenticated,
      message: loadingMessage,
      timestamp: new Date().toISOString() 
    }, 'PROTECTED_ROUTE');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-4 border-white rounded-full mx-auto mb-6"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Carregando...</h2>
          <p className="text-white/80 text-sm">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!isAuthenticated) {
    logger.info('Usuário não autenticado redirecionado para auth', undefined, 'PROTECTED_ROUTE');
    return <Navigate to="/auth" replace />;
  }

  // Renderizar conteúdo protegido se autenticado
  logger.debug('Usuário autenticado, mostrando conteúdo protegido', undefined, 'PROTECTED_ROUTE');
  return <>{children}</>;
};

export default ProtectedRoute;
