
import React from 'react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const { data: isAdmin, isLoading, error } = useIsAdmin();

  logger.debug('Admin Route verificação', {
    userId: user?.id,
    userEmail: user?.email,
    isAuthenticated,
    isAdmin
  }, 'ADMIN_ROUTE');

  if (error) {
    logger.error('Erro na query de verificação admin', { error: error.message }, 'ADMIN_ROUTE');
  }

  if (!isAuthenticated) {
    logger.warn('Usuário não autenticado tentando acessar área admin', undefined, 'ADMIN_ROUTE');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta área.</p>
          <a href="/" className="text-purple-600 hover:text-purple-700 underline">
            Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    logger.debug('Verificando permissões de admin', undefined, 'ADMIN_ROUTE');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    logger.warn('Usuário não é admin tentando acessar área administrativa', {
      userId: user?.id,
      userEmail: user?.email
    }, 'ADMIN_ROUTE');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar o painel administrativo.</p>
          <p className="text-sm text-gray-500 mb-4">
            Apenas administradores podem acessar esta área.
          </p>
          <a href="/" className="text-purple-600 hover:text-purple-700 underline">
            Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  logger.info('Usuário autorizado a acessar área admin', { userId: user?.id }, 'ADMIN_ROUTE');
  return <>{children}</>;
};

export default AdminRoute;
