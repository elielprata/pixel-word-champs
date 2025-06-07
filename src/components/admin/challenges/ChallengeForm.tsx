
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
        <CardTitle>
          {editingChallenge ? 'Editar Desafio' : 'Criar Novo Desafio'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onFormDataChange({ title: e.target.value })}
              placeholder="Nome do desafio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="levels">Níveis</Label>
            <Input
              id="levels"
              type="number"
              value={formData.levels}
              onChange={(e) => onFormDataChange({ levels: parseInt(e.target.value) || 20 })}
              min="1"
              max="100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFormDataChange({ description: e.target.value })}
            placeholder="Descrição do desafio"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Dificuldade</Label>
            <Select 
              value={formData.difficulty} 
              onValueChange={(value) => onFormDataChange({ difficulty: value as any })}
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
            <Label>Tema</Label>
            <Select 
              value={formData.theme} 
              onValueChange={(value) => onFormDataChange({ theme: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão</SelectItem>
                <SelectItem value="morning">Matinal</SelectItem>
                <SelectItem value="nature">Natureza</SelectItem>
                <SelectItem value="geography">Geografia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <Select 
              value={formData.color} 
              onValueChange={(value) => onFormDataChange({ color: value })}
            >
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
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => onFormDataChange({ is_active: checked })}
          />
          <Label htmlFor="is_active">Desafio ativo</Label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={onSubmit} className="flex-1">
            {editingChallenge ? 'Atualizar' : 'Criar'} Desafio
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
