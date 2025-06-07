
import React from 'react';
import { SecurityOverview } from './SecurityOverview';
import { SecurityMetrics } from './SecurityMetrics';
import { SecurityAlerts } from './SecurityAlerts';
import { SecuritySettings } from './SecuritySettings';
import { useSecurityData } from '@/hooks/useSecurityData';
import { Card, CardContent } from "@/components/ui/card";

export const SecurityTab = () => {
  const {
    stats,
    alerts,
    settings,
    loading,
    updateAlertStatus,
    updateSetting,
    exportSecurityReport,
    refreshData
  } = useSecurityData();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando dados de segurança...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <SecurityOverview stats={stats} onRefresh={refreshData} onExport={exportSecurityReport} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SecurityAlerts 
            alerts={alerts} 
            onUpdateStatus={updateAlertStatus}
          />
        </div>
        <div>
          <SecurityMetrics stats={stats} />
        </div>
      </div>
      
      <SecuritySettings 
        settings={settings}
        onUpdateSetting={updateSetting}
      />
    </div>
  );
};
