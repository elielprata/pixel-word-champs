import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import { logger } from '@/utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  logger.debug('ProtectedRoute verificação', { 
    isAuthenticated, 
    isLoading 
  }, 'PROTECTED_ROUTE');

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    logger.debug('Mostrando loading de autenticação', undefined, 'PROTECTED_ROUTE');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-white rounded-full mx-auto mb-4"></div>
          <p className="text-white">Verificando autenticação...</p>
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
