import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from 'lucide-react';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

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
  // Funções auxiliares para manipular data/hora
  const getTimeFromDateTime = (dateTime: string) => {
    if (!dateTime) return '08:00'; // Horário padrão
    const date = new Date(dateTime);
    return date.toTimeString().slice(0, 5); // HH:MM
  };

  const getDateFromDateTime = (dateTime: string) => {
    if (!dateTime) return '';
    return dateTime.split('T')[0]; // YYYY-MM-DD
  };

  const handleTimeChange = (value: string) => {
    const date = getDateFromDateTime(currentData.start_date) || new Date().toISOString().split('T')[0];
    const combinedDateTime = `${date}T${value}:00`;
    console.log('🕐 Horário alterado para:', combinedDateTime);
    onDataChange({ ...currentData, start_date: combinedDateTime });
  };

  const handleDateOnlyChange = (value: string) => {
    const currentTime = getTimeFromDateTime(currentData.start_date);
    const combinedDateTime = `${value}T${currentTime}:00`;
    console.log('📅 Data alterada para:', combinedDateTime);
    onDataChange({ ...currentData, start_date: combinedDateTime });
    
    if (handleStartDateChange) {
      handleStartDateChange(value);
    }
  };

  // Calcular horário de fim para exibição
  const calculateEndTime = () => {
    if (!currentData.start_date) return 'Selecione a data primeiro';
    const startDate = new Date(currentData.start_date);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59);
    return formatBrasiliaDate(endDate);
  };

  return (
    <div className="space-y-4">
      {/* Aviso sobre competições diárias */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-blue-600 font-semibold">📝 Competição Diária</span>
        </div>
        <p className="text-sm text-blue-700">
          Competições diárias não possuem premiação em dinheiro. O foco é na diversão e engajamento dos usuários.
        </p>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="start_date">Data da Competição *</Label>
          <Input
            id="start_date"
            type="date"
            value={getDateFromDateTime(currentData.start_date)}
            onChange={(e) => handleDateOnlyChange(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="start_time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horário de Início *
          </Label>
          <Input
            id="start_time"
            type="time"
            value={getTimeFromDateTime(currentData.start_date)}
            onChange={(e) => handleTimeChange(e.target.value)}
            required
          />
          <p className="text-xs text-blue-600 mt-1">
            🎯 Novo: Defina quando a competição inicia
          </p>
        </div>

        <div>
          <Label>Horário de Término (Automático)</Label>
          <div className="p-2 bg-gray-100 rounded-md border">
            <p className="text-sm text-gray-600">
              {calculateEndTime()}
            </p>
          </div>
          <p className="text-xs text-green-600 mt-1">
            🏁 Fim: Sempre às 23:59:59 (Brasília)
          </p>
        </div>
      </div>

      {/* Visualização do cronograma */}
      {currentData.start_date && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Cronograma da Competição</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-green-600">🚀 Início: </span>
              <span className="font-semibold">
                {formatBrasiliaDate(new Date(currentData.start_date))}
              </span>
            </div>
            <div>
              <span className="text-green-600">🏁 Término: </span>
              <span className="font-semibold">{calculateEndTime()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
