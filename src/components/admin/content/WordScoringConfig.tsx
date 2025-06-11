
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface WordScoringEntry {
  id: string;
  wordSize: number;
  points: number;
  setting_key: string;
}

interface WordScoringConfigProps {
  settings: Array<{
    id: string;
    setting_key: string;
    setting_value: string;
    setting_type: string;
    description: string;
    category: string;
  }>;
  onUpdate: (key: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
}

export const WordScoringConfig = ({ settings, onUpdate, onSave, saving }: WordScoringConfigProps) => {
  const [newWordSize, setNewWordSize] = useState<string>('');
  const [newPoints, setNewPoints] = useState<string>('');
  const { toast } = useToast();

  // Extrair configurações de pontuação existentes
  const scoringEntries: WordScoringEntry[] = settings
    .filter(setting => setting.setting_key.startsWith('points_per_') && setting.setting_key.includes('_letter_word'))
    .map(setting => {
      const match = setting.setting_key.match(/points_per_(\d+|expert)_/);
      const wordSize = match?.[1] === 'expert' ? 8 : parseInt(match?.[1] || '0');
      return {
        id: setting.id,
        wordSize,
        points: parseInt(setting.setting_value),
        setting_key: setting.setting_key
      };
    })
    .sort((a, b) => a.wordSize - b.wordSize);

  const handleAddNew = async () => {
    const wordSize = parseInt(newWordSize);
    const points = parseInt(newPoints);

    if (!wordSize || wordSize < 1 || !points || points < 0) {
      toast({
        title: "Erro",
        description: "Tamanho da palavra deve ser maior que 0 e pontuação não pode ser negativa",
        variant: "destructive"
      });
      return;
    }

    // Verificar se já existe configuração para este tamanho
    const existingEntry = scoringEntries.find(entry => entry.wordSize === wordSize);
    if (existingEntry) {
      toast({
        title: "Erro",
        description: `Já existe configuração para palavras de ${wordSize} letras`,
        variant: "destructive"
      });
      return;
    }

    const setting_key = `points_per_${wordSize}_letter_word`;
    
    try {
      // Inserir nova configuração no banco
      const { error } = await supabase
        .from('game_settings')
        .insert({
          setting_key,
          setting_value: points.toString(),
          setting_type: 'number',
          description: `Pontos por palavra de ${wordSize} letras`,
          category: 'scoring'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nova configuração adicionada com sucesso"
      });

      setNewWordSize('');
      setNewPoints('');
      
      // Recarregar a página para mostrar a nova configuração
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a nova configuração",
        variant: "destructive"
      });
    }
  };

  const handleRemove = async (entry: WordScoringEntry) => {
    try {
      const { error } = await supabase
        .from('game_settings')
        .delete()
        .eq('id', entry.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração removida com sucesso"
      });

      // Recarregar a página para remover a configuração
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a configuração",
        variant: "destructive"
      });
    }
  };

  const handlePointsChange = (entry: WordScoringEntry, newPoints: string) => {
    onUpdate(entry.setting_key, newPoints);
  };

  return (
    <Card className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-slate-800">
            Sistema de Pontuação por Tamanho
          </CardTitle>
          <Badge variant="outline" className="bg-white/50">
            {scoringEntries.length} configurações
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lista de configurações existentes */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700">Configurações Atuais</h4>
          {scoringEntries.map((entry) => (
            <div key={entry.id} className="bg-white/70 rounded-lg p-4 border border-white/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-sm font-medium text-slate-600">
                    {entry.wordSize === 8 ? '8+ letras' : `${entry.wordSize} letras`}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={settings.find(s => s.setting_key === entry.setting_key)?.setting_value || entry.points}
                      onChange={(e) => handlePointsChange(entry, e.target.value)}
                      className="bg-white border-slate-200 w-24"
                      min="0"
                    />
                  </div>
                  <div className="text-sm text-slate-500">pontos</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(entry)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Adicionar nova configuração */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700">Adicionar Nova Configuração</h4>
          <div className="bg-white/70 rounded-lg p-4 border border-white/50">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="wordSize" className="text-sm font-medium text-slate-600">
                  Tamanho da Palavra
                </Label>
                <Input
                  id="wordSize"
                  type="number"
                  value={newWordSize}
                  onChange={(e) => setNewWordSize(e.target.value)}
                  placeholder="Ex: 6"
                  className="bg-white border-slate-200"
                  min="1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="points" className="text-sm font-medium text-slate-600">
                  Pontuação
                </Label>
                <Input
                  id="points"
                  type="number"
                  value={newPoints}
                  onChange={(e) => setNewPoints(e.target.value)}
                  placeholder="Ex: 40"
                  className="bg-white border-slate-200"
                  min="0"
                />
              </div>
              <Button
                onClick={handleAddNew}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!newWordSize || !newPoints}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>

        {/* Botão salvar */}
        <div className="flex justify-end pt-4 border-t border-white/50">
          <Button
            onClick={onSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
