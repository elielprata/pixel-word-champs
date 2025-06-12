
import React from 'react';
import { IntegrationsHeader } from './integrations/IntegrationsHeader';
import { FingerprintJSCard } from './integrations/FingerprintJSCard';
import { IntegrationStatusOverview } from './integrations/IntegrationStatusOverview';
import { useIntegrations } from '@/hooks/useIntegrations';

export const IntegrationsTab = () => {
  const {
    integrations,
    isLoading,
    updateIntegration
  } = useIntegrations();

  const fingerprintJS = integrations?.fingerprintjs || {
    enabled: false,
    api_key: '',
    subdomain: ''
  };

  const handleFingerprintUpdate = (integration: any) => {
    updateIntegration('fingerprintjs', integration);
  };

  const handleSaveIntegration = async (integration: any) => {
    await updateIntegration('fingerprintjs', integration);
  };

  const testConnection = async (type: string) => {
    // Test connection logic here
    console.log('Testing connection for:', type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <IntegrationsHeader />

        <IntegrationStatusOverview
          fingerprintJS={fingerprintJS}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Configurações de Integrações</h2>
            <p className="text-sm text-slate-600 mt-1">Configure e gerencie as integrações disponíveis na plataforma</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <FingerprintJSCard
                integration={fingerprintJS}
                onUpdate={handleFingerprintUpdate}
                onSave={handleSaveIntegration}
                onTest={testConnection}
                loading={isLoading}
                testingConnection={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
