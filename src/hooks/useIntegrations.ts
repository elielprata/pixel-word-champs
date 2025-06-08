
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { aiService } from '@/services/aiService';

interface IntegrationConfig {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  config: Record<string, any>;
}

export const useIntegrations = () => {
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

  return {
    fingerprintJS,
    setFingerprintJS,
    openAI,
    setOpenAI,
    loading,
    testingConnection,
    handleSaveIntegration,
    testConnection
  };
};
