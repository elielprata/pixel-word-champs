
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GameSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  category: string;
}

export const GameSettings = () => {
  const [settings, setSettings] = useState<GameSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .select('*')
        .in('category', ['scoring', 'gameplay']) // Removido 'prizes' da busca
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
      const defaultSettings = {
        'points_per_3_letter_word': '10',
        'points_per_4_letter_word': '20',
        'points_per_5_letter_word': '30',
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

  const groupedSettings = settings.reduce((groups, setting) => {
    const category = setting.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(setting);
    return groups;
  }, {} as Record<string, GameSetting[]>);

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'scoring': return 'Sistema de Pontuação';
      case 'gameplay': return 'Mecânicas do Jogo';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'scoring': return 'from-blue-50 to-cyan-50 border-blue-200';
      case 'gameplay': return 'from-green-50 to-emerald-50 border-green-200';
      default: return 'from-gray-50 to-slate-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-slate-800">Configurações do Jogo</CardTitle>
              <p className="text-sm text-slate-600">
                Ajuste pontuações e mecânicas do jogo. Para valores de premiação, acesse o menu "Premiação".
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar Padrão
              </Button>
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar Tudo'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configurações agrupadas por categoria */}
      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <Card key={category} className={`border-2 bg-gradient-to-br ${getCategoryColor(category)}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-800">
                {getCategoryTitle(category)}
              </CardTitle>
              <Badge variant="outline" className="bg-white/50">
                {categorySettings.length} configurações
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categorySettings.map((setting) => (
                <div key={setting.id} className="bg-white/70 rounded-lg p-4 border border-white/50">
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    {setting.description}
                  </Label>
                  <Input
                    type={setting.setting_type === 'number' ? 'number' : 'text'}
                    value={setting.setting_value}
                    onChange={(e) => updateSetting(setting.setting_key, e.target.value)}
                    className="bg-white border-slate-200"
                    placeholder={`Valor para ${setting.setting_key}`}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Chave: {setting.setting_key}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {Object.keys(groupedSettings).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p>Nenhuma configuração encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
