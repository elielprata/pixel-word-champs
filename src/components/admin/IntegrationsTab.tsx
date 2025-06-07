
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Fingerprint, Brain, Key, Settings, Save, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { aiService } from '@/services/aiService';

interface IntegrationConfig {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  config: Record<string, any>;
}

export const IntegrationsTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  // Estado das integrações
  const [fingerprintJS, setFingerprintJS] = useState<IntegrationConfig>({
    id: 'fingerprintjs',
    name: 'FingerprintJS',
    enabled: false,
    apiKey: '',
    config: {
      endpoint: 'https://api.fpjs.io',
      timeout: 5000,
      enableDeviceTracking: true,
      enableLocationDetection: true,
      confidenceThreshold: 0.8
    }
  });

  const [openAI, setOpenAI] = useState<IntegrationConfig>({
    id: 'openai',
    name: 'OpenAI',
    enabled: false,
    apiKey: '',
    config: {
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.7,
      enableModeration: false,
      systemPrompt: 'Você é um assistente especializado em encontrar palavras em tabuleiros de letras para jogos de caça-palavras.'
    }
  });

  const handleSaveIntegration = async (integration: IntegrationConfig) => {
    setLoading(true);
    try {
      // Configurar o aiService se for OpenAI
      if (integration.id === 'openai' && integration.enabled && integration.apiKey) {
        aiService.setApiKey(integration.apiKey);
        aiService.setConfig({
          model: integration.config.model,
          maxTokens: integration.config.maxTokens,
          temperature: integration.config.temperature,
          systemPrompt: integration.config.systemPrompt
        });
      }
      
      // Aqui você salvaria as configurações no banco de dados
      // Por enquanto, vamos simular o salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Sucesso",
        description: `Integração ${integration.name} salva com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao salvar integração ${integration.name}.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (integrationId: string) => {
    setTestingConnection(integrationId);
    try {
      if (integrationId === 'openai') {
        // Testar conexão com OpenAI
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${openAI.apiKey}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Conexão falhada');
        }
      }
      
      // Simular teste de conexão para outros serviços
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Conexão testada",
        description: "Conexão estabelecida com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com o serviço.",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Integrações</h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          2 Integrações Disponíveis
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* FingerprintJS Integration */}
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
                checked={fingerprintJS.enabled}
                onCheckedChange={(enabled) => setFingerprintJS(prev => ({ ...prev, enabled }))}
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
                    value={fingerprintJS.apiKey}
                    onChange={(e) => setFingerprintJS(prev => ({ ...prev, apiKey: e.target.value }))}
                    disabled={!fingerprintJS.enabled}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('fingerprintjs')}
                    disabled={!fingerprintJS.enabled || !fingerprintJS.apiKey || testingConnection === 'fingerprintjs'}
                  >
                    {testingConnection === 'fingerprintjs' ? (
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
                    value={fingerprintJS.config.confidenceThreshold}
                    onChange={(e) => setFingerprintJS(prev => ({
                      ...prev,
                      config: { ...prev.config, confidenceThreshold: parseFloat(e.target.value) }
                    }))}
                    disabled={!fingerprintJS.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="fingerprint-timeout">Timeout (ms)</Label>
                  <Input
                    id="fingerprint-timeout"
                    type="number"
                    value={fingerprintJS.config.timeout}
                    onChange={(e) => setFingerprintJS(prev => ({
                      ...prev,
                      config: { ...prev.config, timeout: parseInt(e.target.value) }
                    }))}
                    disabled={!fingerprintJS.enabled}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="device-tracking">Rastreamento de Dispositivo</Label>
                  <Switch
                    id="device-tracking"
                    checked={fingerprintJS.config.enableDeviceTracking}
                    onCheckedChange={(checked) => setFingerprintJS(prev => ({
                      ...prev,
                      config: { ...prev.config, enableDeviceTracking: checked }
                    }))}
                    disabled={!fingerprintJS.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="location-detection">Detecção de Localização</Label>
                  <Switch
                    id="location-detection"
                    checked={fingerprintJS.config.enableLocationDetection}
                    onCheckedChange={(checked) => setFingerprintJS(prev => ({
                      ...prev,
                      config: { ...prev.config, enableLocationDetection: checked }
                    }))}
                    disabled={!fingerprintJS.enabled}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-2">
                {fingerprintJS.enabled && fingerprintJS.apiKey ? (
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
                onClick={() => handleSaveIntegration(fingerprintJS)}
                disabled={loading || !fingerprintJS.enabled}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* OpenAI Integration */}
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
                checked={openAI.enabled}
                onCheckedChange={(enabled) => setOpenAI(prev => ({ ...prev, enabled }))}
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
                    value={openAI.apiKey}
                    onChange={(e) => setOpenAI(prev => ({ ...prev, apiKey: e.target.value }))}
                    disabled={!openAI.enabled}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('openai')}
                    disabled={!openAI.enabled || !openAI.apiKey || testingConnection === 'openai'}
                  >
                    {testingConnection === 'openai' ? (
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
                    value={openAI.config.model}
                    onChange={(e) => setOpenAI(prev => ({
                      ...prev,
                      config: { ...prev.config, model: e.target.value }
                    }))}
                    disabled={!openAI.enabled}
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
                    value={openAI.config.maxTokens}
                    onChange={(e) => setOpenAI(prev => ({
                      ...prev,
                      config: { ...prev.config, maxTokens: parseInt(e.target.value) }
                    }))}
                    disabled={!openAI.enabled}
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
                  value={openAI.config.temperature}
                  onChange={(e) => setOpenAI(prev => ({
                    ...prev,
                    config: { ...prev.config, temperature: parseFloat(e.target.value) }
                  }))}
                  disabled={!openAI.enabled}
                />
              </div>

              <div>
                <Label htmlFor="openai-system-prompt">System Prompt</Label>
                <Textarea
                  id="openai-system-prompt"
                  placeholder="Defina o comportamento do assistente para geração de palavras..."
                  value={openAI.config.systemPrompt}
                  onChange={(e) => setOpenAI(prev => ({
                    ...prev,
                    config: { ...prev.config, systemPrompt: e.target.value }
                  }))}
                  disabled={!openAI.enabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-2">
                {openAI.enabled && openAI.apiKey ? (
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
                onClick={() => handleSaveIntegration(openAI)}
                disabled={loading || !openAI.enabled}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Geral das Integrações */}
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
    </div>
  );
};
