
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2 } from 'lucide-react';

interface ScoringSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  category: string;
}

export const WordScoringConfig = () => {
  const [settings, setSettings] = useState<ScoringSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSetting, setNewSetting] = useState({
    setting_key: '',
    setting_value: '',
    setting_type: 'number',
    description: '',
    category: 'scoring'
  });
  const { toast } = useToast();

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      console.log('⚙️ Carregando configurações de pontuação...');
      
      const { data, error } = await supabase
        .from('game_settings')
        .select('*')
        .eq('category', 'scoring')
        .order('setting_key');

      if (error) {
        console.error('❌ Erro ao carregar configurações:', error);
        throw error;
      }

      const formattedSettings = (data || []).map((item: any) => ({
        id: item.id || '',
        setting_key: item.setting_key || '',
        setting_value: item.setting_value || '',
        setting_type: item.setting_type || 'string',
        description: item.description || '',
        category: item.category || 'scoring'
      }));

      setSettings(formattedSettings);
      console.log('✅ Configurações carregadas:', formattedSettings.length);
    } catch (error: any) {
      console.error('❌ Erro ao carregar configurações:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSetting = (id: string, field: keyof ScoringSetting, value: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, [field]: value } : setting
    ));
  };

  const addNewSetting = async () => {
    if (!newSetting.setting_key || !newSetting.setting_value) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a chave e o valor da configuração",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('➕ Adicionando nova configuração...');
      
      const { error } = await supabase
        .from('game_settings')
        .insert({
          setting_key: newSetting.setting_key,
          setting_value: newSetting.setting_value,
          setting_type: newSetting.setting_type,
          description: newSetting.description,
          category: newSetting.category
        } as any);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Nova configuração adicionada",
      });

      setNewSetting({
        setting_key: '',
        setting_value: '',
        setting_type: 'number',
        description: '',
        category: 'scoring'
      });

      loadSettings();
    } catch (error: any) {
      console.error('❌ Erro ao adicionar configuração:', error);
      toast({
        title: "Erro ao adicionar configuração",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteSetting = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return;

    try {
      const { error } = await supabase
        .from('game_settings')
        .delete()
        .eq('id', id as any);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Configuração excluída",
      });

      loadSettings();
    } catch (error: any) {
      console.error('❌ Erro ao excluir configuração:', error);
      toast({
        title: "Erro ao excluir configuração",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const saveAllSettings = async () => {
    setIsSaving(true);
    try {
      console.log('💾 Salvando todas as configurações...');
      
      for (const setting of settings) {
        const { error } = await supabase
          .from('game_settings')
          .update({
            setting_value: setting.setting_value,
            description: setting.description
          } as any)
          .eq('id', setting.id as any);

        if (error) throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Todas as configurações foram salvas",
      });

      console.log('✅ Configurações salvas com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
            <span className="ml-2">Carregando configurações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Configurações de Pontuação</CardTitle>
            <Button onClick={saveAllSettings} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Tudo'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">{setting.setting_key}</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteSetting(setting.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Valor</Label>
                  <Input
                    type={setting.setting_type === 'number' ? 'number' : 'text'}
                    value={setting.setting_value}
                    onChange={(e) => updateSetting(setting.id, 'setting_value', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={setting.description}
                    onChange={(e) => updateSetting(setting.id, 'description', e.target.value)}
                    placeholder="Descrição da configuração"
                  />
                </div>
              </div>
            </div>
          ))}

          <Separator />

          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Configuração
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Chave</Label>
                <Input
                  value={newSetting.setting_key}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, setting_key: e.target.value }))}
                  placeholder="ex: word_base_points"
                />
              </div>
              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={newSetting.setting_value}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, setting_value: e.target.value }))}
                  placeholder="ex: 10"
                />
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={newSetting.description}
                onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da configuração"
              />
            </div>
            <Button onClick={addNewSetting}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Configuração
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
