
import React from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useWeeklyConfigSync } from '@/hooks/useWeeklyConfigSync';

export const SyncStatusIndicator: React.FC = () => {
  const { data: syncedConfig, isLoading, error, refetch } = useWeeklyConfigSync();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-blue-600 text-sm">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Sincronizando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>Erro na sincronização</span>
        <button 
          onClick={() => refetch()}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (syncedConfig) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <CheckCircle className="h-4 w-4" />
        <span>Sincronizado com automação</span>
        <span className="text-gray-500">
          (Período: {syncedConfig.current_week_start} - {syncedConfig.current_week_end})
        </span>
      </div>
    );
  }

  return null;
};
