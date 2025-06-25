
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/integrations/supabase/client';
import { Shield, User, Trash, RefreshCw, Calendar } from 'lucide-react';
import { logger } from '@/utils/logger';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

interface AdminAction {
  id: string;
  admin_id: string;
  target_user_id: string;
  action_type: string;
  details: any;
  created_at: string;
}

const useAdminAuditLog = () => {
  return useQuery({
    queryKey: ['adminAuditLog'],
    queryFn: async (): Promise<AdminAction[]> => {
      logger.debug('Buscando log de auditoria administrativa', undefined, 'ADMIN_AUDIT_LOG');
      
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('Erro ao buscar log de auditoria', { error: error.message }, 'ADMIN_AUDIT_LOG');
        throw error;
      }

      logger.info('Log de auditoria carregado', { count: data?.length || 0 }, 'ADMIN_AUDIT_LOG');
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};

export const AdminAuditLog = () => {
  const { data: auditLog, isLoading, refetch } = useAdminAuditLog();

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'create_admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'ban_user':
        return <User className="h-4 w-4 text-red-600" />;
      case 'delete_user':
        return <Trash className="h-4 w-4 text-red-600" />;
      case 'reset_all_scores':
        return <RefreshCw className="h-4 w-4 text-orange-600" />;
      default:
        return <Calendar className="h-4 w-4 text-slate-600" />;
    }
  };

  const getActionBadge = (actionType: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      create_admin: { variant: 'default', label: 'Criar Admin' },
      ban_user: { variant: 'destructive', label: 'Banir Usuário' },
      delete_user: { variant: 'destructive', label: 'Deletar Usuário' },
      reset_all_scores: { variant: 'secondary', label: 'Reset Pontuações' },
    };

    const config = variants[actionType] || { variant: 'outline', label: actionType };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDetails = (details: any) => {
    if (!details || typeof details !== 'object') return null;
    
    return Object.entries(details).map(([key, value]) => (
      <div key={key} className="text-xs text-slate-600">
        <span className="font-medium">{key}:</span> {String(value)}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Log de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>Log de Auditoria</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-64">
          {!auditLog || auditLog.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Nenhuma ação administrativa registrada
            </div>
          ) : (
            <div className="space-y-3">
              {auditLog.map((action) => (
                <div
                  key={action.id}
                  className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getActionIcon(action.action_type)}
                      {getActionBadge(action.action_type)}
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatBrasiliaDate(new Date(action.created_at))}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><span className="font-medium">Admin ID:</span> {action.admin_id.slice(0, 8)}...</div>
                    <div><span className="font-medium">Alvo ID:</span> {action.target_user_id.slice(0, 8)}...</div>
                    {action.details && (
                      <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                        {formatDetails(action.details)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
