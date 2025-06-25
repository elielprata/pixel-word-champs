
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from 'lucide-react';
import { validateBrasiliaDateRange } from '@/utils/brasiliaTimeUnified';

interface ConfigurationFormProps {
  configType: 'weekly' | 'custom';
  setConfigType: (type: 'weekly' | 'custom') => void;
  startDayOfWeek: number;
  setStartDayOfWeek: (day: number) => void;
  durationDays: number;
  setDurationDays: (days: number) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

export const ConfigurationForm: React.FC<ConfigurationFormProps> = ({
  configType,
  setConfigType,
  startDayOfWeek,
  setStartDayOfWeek,
  durationDays,
  setDurationDays,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate
}) => {
  return (
    <Tabs value={configType} onValueChange={(value) => setConfigType(value as 'weekly' | 'custom')}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="weekly" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Por Semana
        </TabsTrigger>
        <TabsTrigger value="custom" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Datas Específicas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="weekly" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="start-day">Dia de Início da Semana</Label>
          <Select value={startDayOfWeek.toString()} onValueChange={(value) => setStartDayOfWeek(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OF_WEEK.map((day) => (
                <SelectItem key={day.value} value={day.value.toString()}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duração (dias)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            max="30"
            value={durationDays}
            onChange={(e) => setDurationDays(parseInt(e.target.value) || 7)}
          />
        </div>
      </TabsContent>

      <TabsContent value="custom" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Data de Início</Label>
          <Input
            id="start-date"
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-date">Data de Fim</Label>
          <Input
            id="end-date"
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            min={customStartDate}
          />
        </div>

        {customStartDate && customEndDate && !validateBrasiliaDateRange(customStartDate, customEndDate).isValid && (
          <p className="text-sm text-red-600">
            A data de fim deve ser posterior à data de início.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
};
