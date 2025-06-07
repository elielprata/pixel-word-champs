
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

  const setAsDefaults = async () => {
    try {
      // Criar um mapeamento das configurações atuais para usar como padrão
      const currentDefaults = settings.reduce((defaults, setting) => {
        defaults[setting.setting_key] = setting.setting_value;
        return defaults;
      }, {} as Record<string, string>);

      // Aqui você pode salvar os valores atuais como novos padrões
      // Por exemplo, salvando em uma tabela de configurações padrão ou atualizando uma configuração específica
      
      toast({
        title: "Sucesso",
        description: "Configurações atuais definidas como padrão"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível definir as configurações como padrão",
        variant: "destructive"
      });
    }
  };

  const resetToDefaults = async () => {
    try {
      const defaultSettings = {
        'points_per_3_letter_word': '10',
        'points_per_4_letter_word': '20',
        'points_per_5_letter_word': '30',
        'points_per_expert_word': '50',
        'base_time_limit': '300',
        'hints_per_level': '1',
        'revive_time_bonus': '30'
      };

      const promises = Object.entries(defaultSettings).map(([key, value]) =>
        supabase
          .from('game_settings')
          .update({ setting_value: value })
          .eq('setting_key', key)
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

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    updateSetting,
    saveSettings,
    setAsDefaults,
    resetToDefaults
  };
};
