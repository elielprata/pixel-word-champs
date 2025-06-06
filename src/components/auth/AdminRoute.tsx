
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  console.log('=== ADMIN ROUTE DEBUG ===');
  console.log('User object:', user);
  console.log('User ID:', user?.id);
  console.log('User email:', user?.email);
  console.log('Is authenticated:', isAuthenticated);

  const { data: isAdmin, isLoading, error } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('❌ Sem user ID para verificar role');
        return false;
      }
      
      console.log('🔍 Verificando role de admin para user ID:', user.id);
      
      // Primeiro, vamos verificar se o usuário existe na tabela user_roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('📋 Roles do usuário:', userRoles);
      console.log('❌ Erro ao buscar roles:', rolesError);
      
      // Agora vamos usar a função has_role
      const { data, error } = await supabase
        .rpc('has_role', { 
          _user_id: user.id, 
          _role: 'admin' 
        });
      
      console.log('🎯 Resultado da função has_role:', data);
      console.log('❌ Erro da função has_role:', error);
      
      if (error) {
        console.error('Erro ao verificar role de admin:', error);
        return false;
      }
      
      console.log('✅ É admin?', data);
      return data;
    },
    enabled: !!user?.id && isAuthenticated,
  });

  console.log('🔐 Resultado final - isAdmin:', isAdmin);
  console.log('⏳ Carregando:', isLoading);
  console.log('❌ Erro da query:', error);

  if (!isAuthenticated) {
    console.log('🚫 Usuário não autenticado - redirecionando');
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
    console.log('⏳ Verificando permissões...');
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
    console.log('🚫 Usuário não é admin - acesso negado');
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

  console.log('✅ Usuário é admin - permitindo acesso');
  return <>{children}</>;
};

export default AdminRoute;
