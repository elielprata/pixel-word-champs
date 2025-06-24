
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Trophy, Users, Settings, Save, X } from 'lucide-react';
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
    paymentData,
    hasTitle
  } = useUnifiedCompetitionForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(onSuccess);
  };

  const isWeekly = formData.type === 'weekly';
  const showPrizeSection = isWeekly && hasTitle;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Configurações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações Básicas
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
                placeholder="Nome da competição"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Competição *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'daily' | 'weekly') => updateField('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Competição Diária</SelectItem>
                  <SelectItem value="weekly">Competição Semanal</SelectItem>
                </SelectContent>
              </Select>
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

            {isWeekly && (
              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Fim *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                  required
                />
              </div>
            )}
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
        </CardContent>
      </Card>

      {/* Seção de Premiação - apenas para competições semanais */}
      {showPrizeSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Configuração de Premiação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">Prêmio Total Calculado</h3>
                  <p className="text-blue-700">
                    R$ {paymentData.calculateTotalPrize().toFixed(2)} para {paymentData.calculateTotalWinners()} vencedores
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
