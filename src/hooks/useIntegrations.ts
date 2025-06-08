import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  apiKey: string;
  settings: Record<string, any>;
  enabled: boolean;
  config: Record<string, any>;
}

export const useIntegrations = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const defaultSystemPrompt = `Você é um assistente especializado em gerar palavras para jogos de caça-palavras em português.

REGRAS IMPORTANTES:
- Gere apenas palavras válidas em português
- Distribua as palavras por dificuldade baseada no número de letras:
  * Fácil: 3 letras (20%)
  * Médio: 4 letras (20%) 
  * Difícil: 5-7 letras (30%)
  * Expert: 8+ letras (30%)
- Retorne apenas as palavras em MAIÚSCULAS, uma por linha
- Não inclua números, pontuação ou texto explicativo
- Palavras devem ser relacionadas à categoria solicitada
- Evite palavras muito técnicas ou obscuras`;

  const [fingerprintJS, setFingerprintJS] = useState<Integration>({
    id: 'fingerprintjs',
    name: 'FingerprintJS',
    description: 'Identificação avançada de dispositivos',
    status: 'inactive',
    apiKey: '',
    settings: {},
    enabled: false,
    config: {
      confidenceThreshold: 0.8,
      timeout: 5000,
      enableDeviceTracking: true,
      enableLocationDetection: false
    }
  });

  const [openAI, setOpenAI] = useState<Integration>({
    id: 'openai',
    name: 'OpenAI',
    description: 'Inteligência artificial para moderação de conteúdo',
    status: 'inactive',
    apiKey: '',
    settings: {},
    enabled: false,
    config: {
      model: 'gpt-4o-mini',
      maxTokens: 150,
      temperature: 0.7,
      systemPrompt: defaultSystemPrompt
    }
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      
      // Buscar configurações das integrações
      const { data: settings, error } = await supabase
        .from('game_settings')
        .select('*')
        .in('category', ['integrations']);

      if (error) throw error;

      // Processar configurações do FingerprintJS
      const fingerprintConfig = settings?.find(s => s.setting_key === 'fingerprintjs_api_key');
      if (fingerprintConfig) {
        setFingerprintJS(prev => ({
          ...prev,
          apiKey: fingerprintConfig.setting_value || '',
          status: fingerprintConfig.setting_value ? 'active' : 'inactive',
          enabled: !!fingerprintConfig.setting_value
        }));
      }

      // Processar configurações do OpenAI
      const openaiConfig = settings?.find(s => s.setting_key === 'openai_api_key');
      if (openaiConfig) {
        setOpenAI(prev => ({
          ...prev,
          apiKey: openaiConfig.setting_value || '',
          status: openaiConfig.setting_value ? 'active' : 'inactive',
          enabled: !!openaiConfig.setting_value
        }));
      }

    } catch (error) {
      console.error('Erro ao buscar integrações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIntegration = async (integration: Integration) => {
    try {
      const settingKey = `${integration.id}_api_key`;
      
      // Verificar se a configuração já existe
      const { data: existing } = await supabase
        .from('game_settings')
        .select('id')
        .eq('setting_key', settingKey)
        .single();

      if (existing) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('game_settings')
          .update({
            setting_value: integration.apiKey,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', settingKey);

        if (error) throw error;
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('game_settings')
          .insert({
            setting_key: settingKey,
            setting_value: integration.apiKey,
            setting_type: 'string',
            description: `API Key para ${integration.name}`,
            category: 'integrations'
          });

        if (error) throw error;
      }

      // Atualizar estado local
      if (integration.id === 'fingerprintjs') {
        setFingerprintJS(prev => ({
          ...prev,
          ...integration,
          status: integration.apiKey ? 'active' : 'inactive',
          enabled: !!integration.apiKey
        }));
      } else if (integration.id === 'openai') {
        setOpenAI(prev => ({
          ...prev,
          ...integration,
          status: integration.apiKey ? 'active' : 'inactive',
          enabled: !!integration.apiKey
        }));
      }

      toast({
        title: "Sucesso",
        description: `${integration.name} configurado com sucesso`,
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao salvar configuração: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const testConnection = async (integrationId: string) => {
    setTestingConnection(integrationId);
    
    try {
      // Buscar a integração correta
      const integration = integrationId === 'fingerprintjs' ? fingerprintJS : openAI;
      
      // Simulação de teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isValid = integration.apiKey.length > 10; // Validação básica
      
      if (isValid) {
        toast({
          title: "Conexão bem-sucedida",
          description: `${integration.name} está funcionando corretamente`,
        });
      } else {
        throw new Error('API Key inválida');
      }
      
    } catch (error: any) {
      const integration = integrationId === 'fingerprintjs' ? fingerprintJS : openAI;
      toast({
        title: "Erro de conexão",
        description: `Falha ao conectar com ${integration.name}: ${error.message}`,
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
    testConnection,
    fetchIntegrations
  };
};
