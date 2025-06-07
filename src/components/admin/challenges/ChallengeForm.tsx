
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChallengeFormData } from './ChallengeFormData';

interface ChallengeFormProps {
  formData: ChallengeFormData;
  editingChallenge: any;
  onFormDataChange: (updates: Partial<ChallengeFormData>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const ChallengeForm = ({ 
  formData, 
  editingChallenge, 
  onFormDataChange, 
  onSubmit, 
  onCancel 
}: ChallengeFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingChallenge ? 'Editar Desafio' : 'Criar Novo Desafio'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onFormDataChange({ title: e.target.value })}
              placeholder="Ex: Animais do Brasil"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Dificuldade</Label>
            <Select 
              value={formData.difficulty} 
              onValueChange={(value: 'easy' | 'medium' | 'hard') => onFormDataChange({ difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <Input
              id="theme"
              value={formData.theme}
              onChange={(e) => onFormDataChange({ theme: e.target.value })}
              placeholder="Ex: nature, geography"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <Select value={formData.color} onValueChange={(value) => onFormDataChange({ color: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Azul</SelectItem>
                <SelectItem value="green">Verde</SelectItem>
                <SelectItem value="orange">Laranja</SelectItem>
                <SelectItem value="purple">Roxo</SelectItem>
                <SelectItem value="red">Vermelho</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="levels">Níveis</Label>
            <Input
              id="levels"
              type="number"
              value={formData.levels}
              onChange={(e) => onFormDataChange({ levels: parseInt(e.target.value) })}
              min="1"
              max="100"
            />
          </div>

          <div className="space-y-2 flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => onFormDataChange({ is_active: checked })}
            />
            <Label>Ativo</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Data/Hora Início</Label>
            <Input
              id="start_date"
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) => onFormDataChange({ start_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">Data/Hora Fim</Label>
            <Input
              id="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) => onFormDataChange({ end_date: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFormDataChange({ description: e.target.value })}
            placeholder="Descreva o tema do desafio..."
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={onSubmit}
            disabled={!formData.title.trim()}
          >
            {editingChallenge ? 'Atualizar' : 'Criar'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
