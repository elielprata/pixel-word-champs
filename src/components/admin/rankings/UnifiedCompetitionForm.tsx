
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, Clock } from 'lucide-react';
import { useUnifiedCompetitionForm } from '@/hooks/useUnifiedCompetitionForm';
import { formatTimeForDisplay, validateCompetitionDuration, getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

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

  // Preview dos horários calculados
  const getTimePreview = () => {
    if (!formData.startDate || !formData.duration) return null;
    
    // Simular conversão para preview (sem afetar dados reais)
    try {
      const startInput = new Date(formData.startDate + ':00');
      const endInput = new Date(startInput.getTime() + (formData.duration * 60 * 60 * 1000));
      
      const startTime = startInput.toTimeString().slice(0, 5);
      const endTime = endInput.toTimeString().slice(0, 5);
      
      return { startTime, endTime };
    } catch {
      return null;
    }
  };

  // Validação em tempo real
  const getDurationValidation = () => {
    if (!formData.startDate || !formData.duration) return null;
    
    // Simular conversão UTC para validação
    try {
      const brasiliaDate = new Date(formData.startDate + ':00');
      const utcDate = new Date(brasiliaDate.getTime() + (3 * 60 * 60 * 1000));
      return validateCompetitionDuration(utcDate.toISOString(), formData.duration);
    } catch {
      return { isValid: false, error: 'Data inválida' };
    }
  };

  const timePreview = getTimePreview();
  const durationValidation = getDurationValidation();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Criar Competição Diária
          </CardTitle>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              ⏰ Horário atual em Brasília: <strong>{getCurrentBrasiliaTime()}</strong>
            </p>
          </div>
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
              <Label htmlFor="startDate">Data e Horário de Início *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                required
              />
              <p className="text-xs text-blue-600">
                🇧🇷 Horário de Brasília
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duração (horas) *
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="12"
                step="1"
                value={formData.duration}
                onChange={(e) => updateField('duration', parseInt(e.target.value) || 1)}
                placeholder="Ex: 3"
                required
              />
              <p className="text-xs text-gray-500">
                Mínimo: 1 hora | Máximo: 12 horas
              </p>
            </div>
          </div>

          {/* Preview dos Horários */}
          {timePreview && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Preview - Horário de Brasília</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p>🟢 <strong>Início:</strong> {timePreview.startTime}</p>
                <p>🔴 <strong>Término:</strong> {timePreview.endTime}</p>
                <p className="text-xs text-green-600">
                  ⏰ Duração: {formData.duration} {formData.duration === 1 ? 'hora' : 'horas'}
                </p>
              </div>
            </div>
          )}

          {/* Validação de Duração */}
          {durationValidation && !durationValidation.isValid && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <X className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Erro de Duração</span>
              </div>
              <p className="text-sm text-red-700">{durationValidation.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações sobre competições diárias */}
      <Card>
        <CardContent className="p-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">🎯 Competição Diária</h3>
            <div className="text-blue-700 text-sm space-y-1">
              <p>• Sem premiação em dinheiro - foco na diversão e engajamento</p>
              <p>• Participação livre para todos os usuários</p>
              <p>• Duração personalizável de 1 a 12 horas</p>
              <p>• Sempre termina no mesmo dia (limite: 23:59:59)</p>
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
        <Button 
          type="submit" 
          disabled={isSubmitting || (durationValidation && !durationValidation.isValid)}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Criando...' : 'Criar Competição'}
        </Button>
      </div>
    </form>
  );
};
