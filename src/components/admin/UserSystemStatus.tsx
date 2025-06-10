
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Database, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SystemStatus {
  database: 'online' | 'offline';
  authentication: 'online' | 'offline';
  activeConnections: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

const useSystemStatus = () => {
  return useQuery({
    queryKey: ['systemStatus'],
    queryFn: async (): Promise<SystemStatus> => {
      console.log('🔍 Verificando status do sistema...');

      let database: 'online' | 'offline' = 'offline';
      let authentication: 'online' | 'offline' = 'offline';
      let activeConnections = 0;

      try {
        // Testar conexão com o banco
        const { error: dbError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .limit(1);

        database = dbError ? 'offline' : 'online';

        // Testar autenticação
        const { data: authData, error: authError } = await supabase.auth.getSession();
        authentication = authError ? 'offline' : 'online';

        // Calcular conexões ativas baseado em sessões recentes
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        const { count } = await supabase
          .from('game_sessions')
          .select('user_id', { count: 'exact', head: true })
          .gte('started_at', oneHourAgo.toISOString());

        activeConnections = count || 0;

      } catch (error) {
        console.error('❌ Erro ao verificar status do sistema:', error);
      }

      // Determinar saúde geral do sistema
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (database === 'offline' || authentication === 'offline') {
        systemHealth = 'critical';
      } else if (activeConnections < 5) {
        systemHealth = 'warning';
      }

      const status = {
        database,
        authentication,
        activeConnections,
        systemHealth
      };

      console.log('🔍 Status do sistema:', status);
      return status;
    },
    retry: 2,
    refetchInterval: 30000, // Verificar a cada 30 segundos
  });
};

export const UserSystemStatus = () => {
  const { data: status, isLoading, error } = useSystemStatus();

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-purple-600" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-red-600" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Erro ao verificar status</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (service: 'online' | 'offline') => {
    return service === 'online' 
      ? <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>
      : <Badge className="bg-red-100 text-red-800 border-red-200">Offline</Badge>;
  };

  const getHealthBadge = (health: 'healthy' | 'warning' | 'critical') => {
    const variants = {
      healthy: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Saudável' },
      warning: { icon: AlertCircle, bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', label: 'Atenção' },
      critical: { icon: AlertCircle, bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'Crítico' }
    };

    const variant = variants[health];
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.bg} ${variant.text} ${variant.border} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-purple-600" />
          Status do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium">Banco de Dados</span>
            </div>
            {getStatusBadge(status?.database || 'offline')}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium">Autenticação</span>
            </div>
            {getStatusBadge(status?.authentication || 'offline')}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Conexões Ativas</span>
            <Badge variant="outline" className="font-mono">
              {status?.activeConnections || 0}
            </Badge>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Saúde Geral</span>
              {getHealthBadge(status?.systemHealth || 'critical')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
