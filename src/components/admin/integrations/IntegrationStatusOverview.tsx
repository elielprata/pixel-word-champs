
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, Brain, CheckCircle, AlertCircle, Activity, Zap } from 'lucide-react';

interface IntegrationConfig {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  config: Record<string, any>;
}

interface IntegrationStatusOverviewProps {
  fingerprintJS: IntegrationConfig;
  openAI: IntegrationConfig;
}

export const IntegrationStatusOverview = ({ fingerprintJS, openAI }: IntegrationStatusOverviewProps) => {
  const integrations = [fingerprintJS, openAI];
  const activeIntegrations = integrations.filter(integration => integration.enabled && integration.apiKey);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {activeIntegrations.length}
              </p>
              <p className="text-slate-600 text-sm font-medium">Integrações Ativas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Fingerprint className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {fingerprintJS.enabled && fingerprintJS.apiKey ? 'ON' : 'OFF'}
              </p>
              <p className="text-slate-600 text-sm font-medium">FingerprintJS</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {openAI.enabled && openAI.apiKey ? 'ON' : 'OFF'}
              </p>
              <p className="text-slate-600 text-sm font-medium">OpenAI</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {integrations.length}
              </p>
              <p className="text-slate-600 text-sm font-medium">Total Disponível</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
