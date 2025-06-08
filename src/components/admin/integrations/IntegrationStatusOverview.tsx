
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Fingerprint, Brain } from 'lucide-react';

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
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Status das Integrações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <Fingerprint className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-800">FingerprintJS</p>
                <p className="text-sm text-purple-600">Detecção de fraudes</p>
              </div>
            </div>
            <Badge className={fingerprintJS.enabled && fingerprintJS.apiKey ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
              {fingerprintJS.enabled && fingerprintJS.apiKey ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">OpenAI</p>
                <p className="text-sm text-green-600">Geração de palavras</p>
              </div>
            </div>
            <Badge className={openAI.enabled && openAI.apiKey ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
              {openAI.enabled && openAI.apiKey ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
