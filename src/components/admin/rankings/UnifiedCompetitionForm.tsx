
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, Clock } from 'lucide-react';
import { useUnifiedCompetitionForm } from '@/hooks/useUnifiedCompetitionForm';

interface UnifiedCompetitionFormProps {
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const getCurrentBrasiliaTimeSafe = (): string => {
  try {
    const now = new Date();
    const brasiliaTime = now.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    return brasiliaTime.replace(/,\s*/g, ' ').trim();
  } catch (error) {
    console.error('❌ Erro ao obter horário de Brasília:', error);
    return new Date().toLocaleString('pt-BR');
  }
};

const validateCompetitionDurationSafe = (startDate: string, duration: number) => {
  try {
    if (!startDate || !duration || duration < 1) {
      return { isValid: false, error: 'Data de início e duração são obrigatórias' };
    }
    
    if (duration > 12) {
      return { isValid: false, error: 'Duração máxima é de 12 horas' };
    }

    return { isValid: true, error: null };
  } catch (error) {
    console.error('❌ Erro na validação de duração:', error);
    return { isValid: false, error: 'Erro na validação' };
  }
};

export const UnifiedCompetitionForm = ({ 
  onClose, 
  onSuccess, 
  onError 
}: UnifiedCompetitionFormProps) => {
  console.log('🎯 [UnifiedCompetitionForm] INICIANDO COMPONENTE');

  let formHook;
  try {
    formHook = useUnifiedCompetitionForm();
    console.log('✅ [UnifiedCompetitionForm] Hook carregado com sucesso');
  } catch (error) {
    console.error('❌ [UnifiedCompetitionForm] Erro ao carregar hook:', error);
    return (
      <div className="p-4 text-red-600">
        <h3 className="font-bold">Erro no formulário</h3>
        <p>Não foi possível carregar o formulário. Tente novamente.</p>
        <Button onClick={onClose} className="mt-2">Fechar</Button>
      </div>
    );
  }

  const {
    formData,
    updateField,
    submitForm,
    isSubmitting,
    hasTitle
  } = formHook;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 [UnifiedCompetitionForm] Submetendo formulário');
    submitForm(onSuccess);
  };

  // Preview de horários com tratamento de erro
  const getTimePreview = () => {
    if (!formData.startDate || !formData.duration) return null;
    
    try {
      console.log('🎯 [UnifiedCompetitionForm] Gerando preview:', {
        startDate: formData.startDate,
        duration: formData.duration
      });
      
      const startInput = new Date(formData.startDate);
      const endInput = new Date(startInput.getTime() + (formData.duration * 60 * 60 * 1000));
      
      const sameDayLimit = new Date(startInput);
      sameDayLimit.setHours(23, 59, 59, 999);
      
      const finalEnd = endInput > sameDayLimit ? sameDayLimit : endInput;
      
      const startTime = startInput.toTimeString().slice(0, 5);
      const endTime = finalEnd.toTimeString().slice(0, 5);
      
      return { startTime, endTime };
    } catch (error) {
      console.error('❌ [UnifiedCompetitionForm] Erro no preview:', error);
      return null;
    }
  };

  const timePreview = getTimePreview();
  const durationValidation = validateCompetitionDurationSafe(formData.startDate, formData.duration);

  console.log('🎯 [UnifiedCompetitionForm] RENDERIZANDO FORMULÁRIO');

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
              ⏰ Horário atual em Brasília: <strong>{getCurrentBrasiliaTimeSafe()}</strong>
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
                🇧🇷 Horário de Brasília (será exibido igual ao digitado)
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

          {timePreview && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Preview - Horário de Brasília</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p>🟢 <strong>Início:</strong> {timePreview.startTime} (igual ao digitado)</p>
                <p>🔴 <strong>Término:</strong> {timePreview.endTime} (calculado em Brasília)</p>
                <p className="text-xs text-green-600">
                  ⏰ Duração: {formData.duration} {formData.duration === 1 ? 'hora' : 'horas'}
                </p>
              </div>
            </div>
          )}

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
