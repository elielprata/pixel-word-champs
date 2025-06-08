
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Fingerprint, TestTube, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  config: Record<string, any>;
}

interface FingerprintJSCardProps {
  integration: Integration;
  onUpdate: (integration: Integration) => void;
  onSave: (integration: Integration) => void;
  onTest: (integrationId: string) => void;
  loading: boolean;
  testingConnection: string | null;
}

export const FingerprintJSCard = ({ 
  integration, 
  onUpdate, 
  onSave, 
  onTest, 
  loading, 
  testingConnection 
}: FingerprintJSCardProps) => {
  const updateIntegration = (updates: Partial<Integration>) => {
    onUpdate({ ...integration, ...updates });
  };

  const updateConfig = (configUpdates: Record<string, any>) => {
    updateIntegration({
      config: { ...integration.config, ...configUpdates }
    });
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Fingerprint className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-purple-800">FingerprintJS</CardTitle>
              <p className="text-sm text-purple-600 mt-1">Detecção de dispositivos únicos e prevenção de fraudes</p>
            </div>
          </div>
          <Switch
            checked={integration.enabled}
            onCheckedChange={(enabled) => updateIntegration({ enabled })}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="fingerprint-api-key">API Key</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="fingerprint-api-key"
                type="password"
                placeholder="Insira sua API Key do FingerprintJS"
                value={integration.apiKey}
                onChange={(e) => updateIntegration({ apiKey: e.target.value })}
                disabled={!integration.enabled}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTest(integration.id)}
                disabled={!integration.enabled || !integration.apiKey || testingConnection === integration.id}
              >
                {testingConnection === integration.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="fingerprint-threshold">Threshold de Confiança</Label>
              <Input
                id="fingerprint-threshold"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={integration.config.confidenceThreshold || 0.8}
                onChange={(e) => updateConfig({ confidenceThreshold: parseFloat(e.target.value) })}
                disabled={!integration.enabled}
              />
            </div>
            <div>
              <Label htmlFor="fingerprint-timeout">Timeout (ms)</Label>
              <Input
                id="fingerprint-timeout"
                type="number"
                value={integration.config.timeout || 5000}
                onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) })}
                disabled={!integration.enabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="device-tracking">Rastreamento de Dispositivo</Label>
              <Switch
                id="device-tracking"
                checked={integration.config.enableDeviceTracking || false}
                onCheckedChange={(checked) => updateConfig({ enableDeviceTracking: checked })}
                disabled={!integration.enabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="location-detection">Detecção de Localização</Label>
              <Switch
                id="location-detection"
                checked={integration.config.enableLocationDetection || false}
                onCheckedChange={(checked) => updateConfig({ enableLocationDetection: checked })}
                disabled={!integration.enabled}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-2">
            {integration.enabled && integration.apiKey ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Configurado</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">Não configurado</span>
              </>
            )}
          </div>
          <Button
            onClick={() => onSave(integration)}
            disabled={loading || !integration.enabled}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
