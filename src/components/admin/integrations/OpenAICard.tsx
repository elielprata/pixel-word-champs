
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Brain, TestTube, Save, CheckCircle, AlertCircle } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  config: Record<string, any>;
}

interface OpenAICardProps {
  integration: Integration;
  onUpdate: (integration: Integration) => void;
  onSave: (integration: Integration) => void;
  onTest: (integrationId: string) => void;
  loading: boolean;
  testingConnection: string | null;
}

export const OpenAICard = ({ 
  integration, 
  onUpdate, 
  onSave, 
  onTest, 
  loading, 
  testingConnection 
}: OpenAICardProps) => {
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
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-green-800">OpenAI</CardTitle>
              <p className="text-sm text-green-600 mt-1">Geração inteligente de palavras para o jogo</p>
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
            <Label htmlFor="openai-api-key">API Key</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="openai-api-key"
                type="password"
                placeholder="Insira sua API Key da OpenAI"
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="openai-model">Modelo</Label>
              <select
                id="openai-model"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={integration.config.model || 'gpt-4o-mini'}
                onChange={(e) => updateConfig({ model: e.target.value })}
                disabled={!integration.enabled}
              >
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4o">GPT-4o</option>
              </select>
            </div>
            <div>
              <Label htmlFor="openai-max-tokens">Max Tokens</Label>
              <Input
                id="openai-max-tokens"
                type="number"
                value={integration.config.maxTokens || 150}
                onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) })}
                disabled={!integration.enabled}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="openai-temperature">Temperature</Label>
            <Input
              id="openai-temperature"
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={integration.config.temperature || 0.7}
              onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
              disabled={!integration.enabled}
            />
          </div>

          <div>
            <Label htmlFor="openai-system-prompt">System Prompt</Label>
            <Textarea
              id="openai-system-prompt"
              placeholder="Defina o comportamento do assistente para geração de palavras..."
              value={integration.config.systemPrompt || 'Você é um assistente especializado em gerar palavras para jogos de caça-palavras.'}
              onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
              disabled={!integration.enabled}
              rows={3}
            />
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
