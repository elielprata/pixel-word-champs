
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useIntegrations = () => {
  const [integrations, setIntegrations] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [fingerprintJS, setFingerprintJS] = useState<any>({ enabled: false, apiKey: '' });
  const [testingConnection, setTestingConnection] = useState(false);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .select('setting_key, setting_value')
        .eq('category', 'integrations' as any);

      if (error) throw error;

      const validData = (data || [])
        .filter((item: any) => item && typeof item === 'object' && !('error' in item));

      const integrationsData = validData.reduce((acc: any, setting: any) => {
        if (setting.setting_key && setting.setting_value !== undefined) {
          // Parse integration settings
          if (setting.setting_key === 'fingerprintjs_enabled') {
            acc.fingerprintjs = {
              enabled: setting.setting_value === 'true',
              apiKey: ''
            };
          }
          if (setting.setting_key === 'fingerprintjs_api_key') {
            if (!acc.fingerprintjs) acc.fingerprintjs = { enabled: false };
            acc.fingerprintjs.apiKey = setting.setting_value;
          }
        }
        return acc;
      }, {});

      setIntegrations(integrationsData);
      
      // Set FingerprintJS state
      if (integrationsData.fingerprintjs) {
        setFingerprintJS(integrationsData.fingerprintjs);
      }
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
      setIntegrations({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const updateIntegration = async (key: string, value: any) => {
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('game_settings')
        .select('id')
        .eq('setting_key', key as any)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('game_settings')
          .update({
            setting_value: String(value),
            updated_at: new Date().toISOString()
          } as any)
          .eq('setting_key', key as any);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('game_settings')
          .insert({
            setting_key: key,
            setting_value: String(value),
            setting_type: 'string',
            description: `Integration setting for ${key}`,
            category: 'integrations'
          } as any);

        if (error) throw error;
      }

      // Refresh integrations
      setIsLoading(true);
      await fetchIntegrations();
    } catch (error) {
      console.error('Erro ao atualizar integração:', error);
      throw error;
    }
  };

  const handleSaveIntegration = async (integration: any) => {
    try {
      await updateIntegration('fingerprintjs_enabled', integration.enabled);
      if (integration.apiKey) {
        await updateIntegration('fingerprintjs_api_key', integration.apiKey);
      }
    } catch (error) {
      console.error('Error saving integration:', error);
      throw error;
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setTestingConnection(false);
    }
  };

  return {
    integrations,
    isLoading,
    updateIntegration,
    fingerprintJS,
    setFingerprintJS,
    loading: isLoading,
    testingConnection,
    handleSaveIntegration,
    testConnection
  };
};
