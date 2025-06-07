
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
        .in('category', ['scoring', 'gameplay'])
        .order('category', { ascending: true })
        .order('setting_key', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
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
          .update({ setting_value: setting.setting_value })
          .eq('id', setting.id)
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

  const resetToDefaults = async () => {
    try {
      const { data: defaultSettings, error: fetchError } = await supabase
        .from('default_game_settings')
        .select('setting_key, setting_value');

      if (fetchError) throw fetchError;

      if (!defaultSettings || defaultSettings.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhuma configuração padrão encontrada",
          variant: "destructive"
        });
        return;
      }

      const promises = defaultSettings.map(defaultSetting =>
        supabase
          .from('game_settings')
          .update({ setting_value: defaultSetting.setting_value })
          .eq('setting_key', defaultSetting.setting_key)
      );

      await Promise.all(promises);
      await fetchSettings();

      toast({
        title: "Sucesso",
        description: "Configurações restauradas para os valores padrão"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível restaurar as configurações",
        variant: "destructive"
      });
    }
  };

  const setAsDefaults = async () => {
    try {
      const promises = settings.map(setting =>
        supabase
          .from('default_game_settings')
          .upsert({
            setting_key: setting.setting_key,
            setting_value: setting.setting_value,
            description: setting.description,
            category: setting.category
          }, {
            onConflict: 'setting_key'
          })
      );

      await Promise.all(promises);

      toast({
        title: "Sucesso",
        description: "Configurações atuais definidas como padrão no banco de dados"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível definir as configurações como padrão",
        variant: "destructive"
      });
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
    resetToDefaults,
    setAsDefaults
  };
};
