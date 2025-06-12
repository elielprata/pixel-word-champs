
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GameSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  category: string;
}

export const useGameSettings = () => {
  const [settings, setSettings] = useState<GameSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .select('*')
        .in('category', ['scoring', 'gameplay'] as any)
        .order('category', { ascending: true })
        .order('setting_key', { ascending: true });

      if (error) throw error;
      
      // Filter and validate data
      const validSettings = (data || [])
        .filter((item: any) => item && typeof item === 'object' && !('error' in item))
        .map((item: any) => ({
          id: item.id || '',
          setting_key: item.setting_key || '',
          setting_value: item.setting_value || '',
          setting_type: item.setting_type || 'string',
          description: item.description || '',
          category: item.category || 'general'
        })) as GameSetting[];
        
      setSettings(validSettings);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refetchSettings = async () => {
    setLoading(true);
    await fetchSettings();
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => prev.map(setting => 
      setting.setting_key === key 
        ? { ...setting, setting_value: value }
        : setting
    ));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const promises = settings.map(setting => 
        supabase
          .from('game_settings')
          .update({ setting_value: setting.setting_value } as any)
          .eq('id', setting.id as any)
      );

      await Promise.all(promises);

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    updateSetting,
    saveSettings,
    refetchSettings
  };
};
