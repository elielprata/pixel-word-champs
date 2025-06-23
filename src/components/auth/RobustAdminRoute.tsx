
import React, { useState, useEffect } from 'react';
import { useIsAdminRobust } from '@/hooks/useIsAdminRobust';
import { useAuth } from '@/hooks/useAuth';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from 'lucide-react';
import { logger } from '@/utils/logger';

interface RobustAdminRouteProps {
  children: React.ReactNode;
}

const RobustAdminRoute = ({ children }: RobustAdminRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const { data: isAdmin, isLoading, error, refetch } = useIsAdminRobust();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    if (error && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        logger.info(`Tentativa automática ${retryCount + 1} de verificação admin`, undefined, 'ROBUST_ADMIN_ROUTE');
        refetch();
        setRetryCount(prev => prev + 1);
      }, 2000 * Math.pow(2, retryCount)); // Backoff exponencial
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, refetch]);

  logger.debug('RobustAdminRoute verificação', {
    userId: user?.id,
    userEmail: user?.email,
    isAuthenticated,
    isAdmin,
    hasError: !!error,
    retryCount
  }, 'ROBUST_ADMIN_ROUTE');

  if (!isAuthenticated) {
    logger.warn('Usuário não autenticado tentando acessar área admin', undefined, 'ROBUST_ADMIN_ROUTE');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta área.</p>
          <a href="/auth" className="text-purple-600 hover:text-purple-700 underline font-medium">
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    logger.debug('Verificando permissões de admin', { retryCount }, 'ROBUST_ADMIN_ROUTE');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Tentativa {retryCount} de {maxRetries}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error && retryCount >= maxRetries) {
    logger.error('Falha crítica na verificação de admin após múltiplas tentativas', { 
      error: error.message,
      retryCount 
    }, 'ROBUST_ADMIN_ROUTE');
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro de Verificação</h1>
          <p className="text-gray-600 mb-4">
            Não foi possível verificar suas permissões administrativas. Tente novamente.
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => {
                setRetryCount(0);
                refetch();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    logger.warn('Usuário não é admin tentando acessar área administrativa', {
      userId: user?.id,
      userEmail: user?.email
    }, 'ROBUST_ADMIN_ROUTE');
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar o painel administrativo.</p>
          <p className="text-sm text-gray-500 mb-4">
            Apenas administradores podem acessar esta área.
          </p>
          <a href="/" className="text-purple-600 hover:text-purple-700 underline font-medium">
            Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  logger.info('Usuário autorizado a acessar área admin', { userId: user?.id }, 'ROBUST_ADMIN_ROUTE');
  
  return (
    <AdminErrorBoundary>
      {children}
    </AdminErrorBoundary>
  );
};

export default RobustAdminRoute;
