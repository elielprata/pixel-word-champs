
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WordScoringSetting {
  id: string;
  word_length: number;
  points: number;
}

export const WordScoringConfig = () => {
  const [settings, setSettings] = useState<WordScoringSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWordScoringSettings();
  }, []);

  const fetchWordScoringSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .select('*')
        .like('setting_key', 'points_per_%_letter_word')
        .eq('category', 'scoring')
        .order('setting_key');

      if (error) throw error;

      const parsedSettings = data.map(setting => {
        const lengthMatch = setting.setting_key.match(/points_per_(\d+)_letter_word/);
        const wordLength = lengthMatch ? parseInt(lengthMatch[1]) : 0;
        
        return {
          id: setting.id,
          word_length: wordLength,
          points: parseInt(setting.setting_value)
        };
      }).sort((a, b) => a.word_length - b.word_length);

      setSettings(parsedSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de pontuação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addNewSetting = () => {
    const maxLength = Math.max(...settings.map(s => s.word_length), 0);
    const newSetting: WordScoringSetting = {
      id: `new_${Date.now()}`,
      word_length: maxLength + 1,
      points: 10
    };
    setSettings([...settings, newSetting]);
  };

  const updateSetting = (id: string, field: keyof WordScoringSetting, value: number) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, [field]: value } : setting
    ));
  };

  const removeSetting = (id: string) => {
    setSettings(prev => prev.filter(setting => setting.id !== id));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Primeiro, deletar configurações antigas
      await supabase
        .from('game_settings')
        .delete()
        .like('setting_key', 'points_per_%_letter_word');

      // Inserir novas configurações
      const newSettings = settings.map(setting => ({
        setting_key: `points_per_${setting.word_length}_letter_word`,
        setting_value: setting.points.toString(),
        setting_type: 'number',
        category: 'scoring',
        description: `Pontos por palavra de ${setting.word_length} letras`
      }));

      const { error } = await supabase
        .from('game_settings')
        .insert(newSettings);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações de pontuação salvas com sucesso"
      });

      // Recarregar para obter os IDs corretos
      await fetchWordScoringSettings();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Carregando configurações de pontuação...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-slate-800">
              Pontuação por Tamanho de Palavra
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Configure quantos pontos cada tamanho de palavra vale
            </p>
          </div>
          <Badge variant="outline" className="bg-white/50">
            {settings.length} configurações
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {settings.map((setting) => (
            <div key={setting.id} className="bg-white/70 rounded-lg p-4 border border-white/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Tamanho da Palavra
                  </Label>
                  <Input
                    type="number"
                    value={setting.word_length}
                    onChange={(e) => updateSetting(setting.id, 'word_length', parseInt(e.target.value) || 0)}
                    className="bg-white border-slate-200"
                    min={1}
                    max={15}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Pontos
                  </Label>
                  <Input
                    type="number"
                    value={setting.points}
                    onChange={(e) => updateSetting(setting.id, 'points', parseInt(e.target.value) || 0)}
                    className="bg-white border-slate-200"
                    min={0}
                    step={5}
                  />
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSetting(setting.id)}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4 border-t border-white/50">
          <Button
            variant="outline"
            onClick={addNewSetting}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Tamanho
          </Button>
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
