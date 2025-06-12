
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface DailyCompetitionFormFieldsProps {
  currentData: DailyCompetition | any;
  onDataChange: (data: any) => void;
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

export const DailyCompetitionFormFields: React.FC<DailyCompetitionFormFieldsProps> = ({
  currentData,
  onDataChange,
  handleStartDateChange
}) => {
  // Calcular datas formatadas para exibição
  const startFormatted = currentData.start_date ? formatDailyCompetitionTime(currentData.start_date, false) : '';
  const endFormatted = currentData.start_date ? formatDailyCompetitionTime(currentData.start_date, true) : '';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={currentData.title || ''}
            onChange={(e) => onDataChange({ ...currentData, title: e.target.value })}
            placeholder="Ex: Desafio dos Animais"
            required
          />
        </div>

        <div>
          <Label htmlFor="theme">Tema *</Label>
          <Select
            value={currentData.theme || ''}
            onValueChange={(value) => onDataChange({ ...currentData, theme: value })}
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
          onChange={(e) => onDataChange({ ...currentData, description: e.target.value })}
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
              onDataChange({ ...currentData, start_date: `${newDate}T00:00:00` });
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
    </div>
  );
};
