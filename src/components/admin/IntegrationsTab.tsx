
import React from 'react';
import { IntegrationsHeader } from './integrations/IntegrationsHeader';
import { FingerprintJSCard } from './integrations/FingerprintJSCard';
import { OpenAICard } from './integrations/OpenAICard';
import { IntegrationStatusOverview } from './integrations/IntegrationStatusOverview';
import { useIntegrations } from '@/hooks/useIntegrations';

export const IntegrationsTab = () => {
  const {
    fingerprintJS,
    setFingerprintJS,
    openAI,
    setOpenAI,
    loading,
    testingConnection,
    handleSaveIntegration,
    testConnection
  } = useIntegrations();

  return (
    <div className="space-y-6">
      <IntegrationsHeader />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <FingerprintJSCard
          integration={fingerprintJS}
          onUpdate={setFingerprintJS}
          onSave={handleSaveIntegration}
          onTest={testConnection}
          loading={loading}
          testingConnection={testingConnection}
        />

        <OpenAICard
          integration={openAI}
          onUpdate={setOpenAI}
          onSave={handleSaveIntegration}
          onTest={testConnection}
          loading={loading}
          testingConnection={testingConnection}
        />
      </div>

      <IntegrationStatusOverview
        fingerprintJS={fingerprintJS}
        openAI={openAI}
      />
    </div>
  );
};
