
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, Settings, Save, X } from 'lucide-react';
import { useUnifiedCompetitionForm } from '@/hooks/useUnifiedCompetitionForm';

interface UnifiedCompetitionFormProps {
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const UnifiedCompetitionForm = ({ 
  onClose, 
  onSuccess, 
  onError 
}: UnifiedCompetitionFormProps) => {
  const {
    formData,
    updateField,
    submitForm,
    isSubmitting,
    hasTitle
  } = useUnifiedCompetitionForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(onSuccess);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Configurações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Criar Competição Diária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Descreva a competição..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
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
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações sobre competições diárias */}
      <Card>
        <CardContent className="p-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">🎯 Competição Diária</h3>
            <p className="text-blue-700 text-sm">
              Competições diárias não possuem premiação em dinheiro. 
              O foco é na diversão e engajamento dos usuários. A competição terminará automaticamente às 23:59 do dia selecionado.
            </p>
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
          {isSubmitting ? 'Criando...' : 'Criar Competição'}
        </Button>
      </div>
    </form>
  );
};
