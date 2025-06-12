
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      logger.debug('Verificando permissões de admin', { userId: user.id }, 'ADMIN_ROUTE');
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error) {
        logger.warn('Erro ao verificar role de admin', { 
          error: error.message,
          userId: user.id 
        }, 'ADMIN_ROUTE');
        return false;
      }

      const hasAdminRole = !!data;
      logger.info('Verificação de admin concluída', { 
        userId: user.id,
        hasAdminRole 
      }, 'ADMIN_ROUTE');
      
      return hasAdminRole;
    },
    enabled: !!user?.id && isAuthenticated,
  });

  // Loading states
  if (authLoading || roleLoading) {
    logger.debug('AdminRoute carregando', { authLoading, roleLoading }, 'ADMIN_ROUTE');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    logger.warn('Acesso negado: usuário não autenticado', undefined, 'ADMIN_ROUTE');
    return <Navigate to="/auth" replace />;
  }

  // Not admin
  if (!isAdmin) {
    logger.warn('Acesso negado: usuário sem permissões de admin', { 
      userId: user?.id 
    }, 'ADMIN_ROUTE');
    return <Navigate to="/" replace />;
  }

  // Admin access granted
  logger.info('Acesso ao painel admin autorizado', { 
    userId: user?.id 
  }, 'ADMIN_ROUTE');
  
  return <>{children}</>;
};

export default AdminRoute;
