
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';

export const SystemHealthMonitor = () => {
  const { systemHealth, refetchAll } = useAdminData();

  if (!systemHealth) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-slate-600">Verificando saúde do sistema...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="text-xs">
        {status ? "OK" : "ERRO"}
      </Badge>
    );
  };

  const getPerformanceColor = (ms: number) => {
    if (ms < 500) return "text-green-600";
    if (ms < 1000) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-700 flex items-center justify-between">
          <span>Status do Sistema</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetchAll}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(systemHealth.database)}
              <span>Banco de Dados</span>
            </div>
            {getStatusBadge(systemHealth.database)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(systemHealth.authentication)}
              <span>Autenticação</span>
            </div>
            {getStatusBadge(systemHealth.authentication)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(systemHealth.permissions)}
              <span>Permissões</span>
            </div>
            {getStatusBadge(systemHealth.permissions)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Performance</span>
            </div>
            <span className={`font-medium ${getPerformanceColor(systemHealth.performance)}`}>
              {systemHealth.performance}ms
            </span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500 text-center">
            Última verificação: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
