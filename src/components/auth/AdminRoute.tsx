import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { logger } from '@/utils/logger';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  logger.debug('Admin Route verificação', {
    userId: user?.id,
    userEmail: user?.email,
    isAuthenticated
  }, 'ADMIN_ROUTE');

  const { data: isAdmin, isLoading, error } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        logger.warn('Sem user ID para verificar role', undefined, 'ADMIN_ROUTE');
        return false;
      }
      
      logger.debug('Verificando role de admin', { userId: user.id }, 'ADMIN_ROUTE');
      
      // Primeiro, verificar se o usuário existe na tabela user_roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      
      if (rolesError) {
        logger.error('Erro ao buscar roles', { error: rolesError.message }, 'ADMIN_ROUTE');
      } else {
        logger.debug('Roles do usuário encontradas', { roles: userRoles }, 'ADMIN_ROUTE');
      }
      
      // Usar a função has_role
      const { data, error } = await supabase
        .rpc('has_role', { 
          _user_id: user.id, 
          _role: 'admin' 
        });
      
      if (error) {
        logger.error('Erro ao verificar role de admin', { error: error.message }, 'ADMIN_ROUTE');
        return false;
      }
      
      logger.info('Verificação de admin concluída', { isAdmin: data }, 'ADMIN_ROUTE');
      return data;
    },
    enabled: !!user?.id && isAuthenticated,
  });

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
            User ID: {user?.id} | Email: {user?.email}
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
