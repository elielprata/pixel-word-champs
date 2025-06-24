
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Trophy, Settings, Save, X, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIndependentDailyCompetitionForm } from '@/hooks/useIndependentDailyCompetitionForm';

interface IndependentDailyCompetitionFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const themes = [
  { value: 'geral', label: 'Geral' },
  { value: 'esportes', label: 'Esportes' },
  { value: 'natureza', label: 'Natureza' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'cultura', label: 'Cultura' }
];

export const IndependentDailyCompetitionForm = ({ 
  onClose, 
  onSuccess
}: IndependentDailyCompetitionFormProps) => {
  const {
    formData,
    updateField,
    submitForm,
    isSubmitting,
    validateForm
  } = useIndependentDailyCompetitionForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm();
    if (validation.isValid) {
      submitForm(onSuccess);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Nova Competição Independente:</strong> Esta competição funcionará de forma 
          independente, sem necessidade de vinculação a torneios semanais. Pontos serão 
          automaticamente adicionados ao ranking semanal.
        </AlertDescription>
      </Alert>

      {/* Configurações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações da Competição Diária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Nome da competição diária"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Tema *</Label>
              <Select 
                value={formData.theme} 
                onValueChange={(value) => updateField('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tema" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map(theme => (
                    <SelectItem key={theme.value} value={theme.value}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Descreva a competição..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data/Hora de Início *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Máximo de Participantes</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => updateField('maxParticipants', parseInt(e.target.value) || 1000)}
                min="1"
                placeholder="1000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sistema Independente Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Trophy className="h-4 w-4" />
            Sistema Independente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="space-y-2 text-sm text-green-800">
              <p>✅ <strong>Funcionamento Automático:</strong> Não requer vinculação semanal</p>
              <p>✅ <strong>Pontuação Direta:</strong> Pontos vão direto para o ranking semanal</p>
              <p>✅ <strong>Gestão Simplificada:</strong> Criação e gerenciamento mais rápidos</p>
              <p>✅ <strong>Compatibilidade:</strong> Funciona com o sistema atual de rankings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Criando...' : 'Criar Competição Independente'}
        </Button>
      </div>
    </form>
  );
};
