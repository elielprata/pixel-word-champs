
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Info } from 'lucide-react';
import { useDailyCompetitionValidation } from '@/hooks/useDailyCompetitionValidation';
import { formatDailyCompetitionTime } from '@/utils/dailyCompetitionValidation';

interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  status: string;
  created_at: string;
}

interface DailyCompetitionFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  competition: DailyCompetition | null;
  newCompetition: any;
  onNewCompetitionChange: (data: any) => void;
  onSubmit: (data: any) => void;
  isEditing: boolean;
  handleStartDateChange?: (date: string) => void;
}

const competitionThemes = [
  { value: 'animais', label: 'Animais' },
  { value: 'comida', label: 'Comida' },
  { value: 'esportes', label: 'Esportes' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'natureza', label: 'Natureza' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'história', label: 'História' },
  { value: 'ciência', label: 'Ciência' }
];

export const DailyCompetitionForm: React.FC<DailyCompetitionFormProps> = ({
  isOpen,
  onOpenChange,
  competition,
  newCompetition,
  onNewCompetitionChange,
  onSubmit,
  isEditing,
  handleStartDateChange
}) => {
  const { validateAndPrepareData, checkExistingCompetition } = useDailyCompetitionValidation();

  // Verificar competição existente quando abrir modal de edição
  useEffect(() => {
    if (isOpen && isEditing && competition) {
      checkExistingCompetition(competition);
    }
  }, [isOpen, isEditing, competition, checkExistingCompetition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('📝 Form: Submetendo dados brutos:', newCompetition || competition);
      
      // Aplicar validação e correção automática
      const dataToSubmit = isEditing ? competition : newCompetition;
      const validatedData = validateAndPrepareData(dataToSubmit);
      
      console.log('✅ Form: Dados validados para submissão:', validatedData);
      
      await onSubmit(validatedData);
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Form: Erro no submit:', error);
    }
  };

  const currentData = isEditing ? competition : newCompetition;

  if (!currentData) return null;

  // Calcular datas formatadas para exibição
  const startFormatted = currentData.start_date ? formatDailyCompetitionTime(currentData.start_date, false) : '';
  const endFormatted = currentData.start_date ? formatDailyCompetitionTime(currentData.start_date, true) : '';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Competição Diária' : 'Nova Competição Diária'}
          </DialogTitle>
        </DialogHeader>

        {/* Aviso sobre horários fixos */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Horários Fixos para Competições Diárias</p>
                <p>• <strong>Início:</strong> Sempre às 00:00:00 do dia selecionado</p>
                <p>• <strong>Fim:</strong> Sempre às 23:59:59 do mesmo dia</p>
                <p className="mt-2 text-xs text-blue-600">
                  ℹ️ O sistema ajusta automaticamente o horário de término
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={currentData.title || ''}
                onChange={(e) => onNewCompetitionChange({ ...currentData, title: e.target.value })}
                placeholder="Ex: Desafio dos Animais"
                required
              />
            </div>

            <div>
              <Label htmlFor="theme">Tema *</Label>
              <Select
                value={currentData.theme || ''}
                onValueChange={(value) => onNewCompetitionChange({ ...currentData, theme: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tema" />
                </SelectTrigger>
                <SelectContent>
                  {competitionThemes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={currentData.description || ''}
              onChange={(e) => onNewCompetitionChange({ ...currentData, description: e.target.value })}
              placeholder="Descreva a competição..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data da Competição *</Label>
              <Input
                id="start_date"
                type="date"
                value={currentData.start_date ? currentData.start_date.split('T')[0] : ''}
                onChange={(e) => {
                  const newDate = e.target.value;
                  onNewCompetitionChange({ ...currentData, start_date: `${newDate}T00:00:00` });
                  if (handleStartDateChange) {
                    handleStartDateChange(newDate);
                  }
                }}
                required
              />
              {startFormatted && (
                <p className="text-xs text-green-600 mt-1">
                  🕐 Início: {startFormatted}
                </p>
              )}
            </div>

            <div>
              <Label>Horário de Término (Automático)</Label>
              <div className="p-2 bg-gray-100 rounded-md border">
                <p className="text-sm text-gray-600">
                  {endFormatted || 'Selecione a data primeiro'}
                </p>
              </div>
              {endFormatted && (
                <p className="text-xs text-green-600 mt-1">
                  🏁 Fim: {endFormatted}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {isEditing ? 'Atualizar' : 'Criar'} Competição
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
