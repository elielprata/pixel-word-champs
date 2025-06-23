
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock } from 'lucide-react';

interface ScheduleSectionProps {
  formData: any;
  onInputChange: (field: string, value: any) => void;
  competitionType: string;
}

export const ScheduleSection = ({ formData, onInputChange, competitionType }: ScheduleSectionProps) => {
  console.log('📅 RADICAL: ScheduleSection renderizando com tipo:', competitionType);
  
  const handleDateChange = (field: string, value: string) => {
    console.log(`📅 RADICAL: Data alterada - ${field}:`, value);
    console.log('📅 RADICAL: Valor será enviado como STRING SIMPLES para o backend');
    onInputChange(field, value);
  };

  const handleTimeChange = (field: string, value: string) => {
    console.log(`🕐 RADICAL: Horário alterado - ${field}:`, value);
    
    // Se for horário de início, combinar com a data
    if (field === 'startTime') {
      const date = formData.startDate || new Date().toISOString().split('T')[0];
      const combinedDateTime = `${date}T${value}:00`;
      console.log('🕐 RADICAL: Data e horário combinados:', combinedDateTime);
      onInputChange('startDate', combinedDateTime);
    }
  };

  // Extrair horário da data para exibição
  const getTimeFromDateTime = (dateTime: string) => {
    if (!dateTime) return '08:00'; // Horário padrão
    const date = new Date(dateTime);
    return date.toTimeString().slice(0, 5); // HH:MM
  };

  const getDateFromDateTime = (dateTime: string) => {
    if (!dateTime) return '';
    return dateTime.split('T')[0]; // YYYY-MM-DD
  };

  if (competitionType === 'daily') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Agendamento da Competição Diária</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data da Competição</Label>
            <Input
              id="startDate"
              type="date"
              value={getDateFromDateTime(formData.startDate)}
              onChange={(e) => {
                const currentTime = getTimeFromDateTime(formData.startDate);
                const combinedDateTime = `${e.target.value}T${currentTime}:00`;
                handleDateChange('startDate', combinedDateTime);
              }}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário de Início
            </Label>
            <Input
              id="startTime"
              type="time"
              value={getTimeFromDateTime(formData.startDate)}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-blue-600">
              🎯 Novo: Defina o horário de início da competição
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700 mb-1">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Horário de Finalização (Automático)</span>
          </div>
          <p className="text-sm text-green-600">
            ⚡ SISTEMA RADICAL: A competição terminará automaticamente às <strong>23:59:59</strong> (Brasília)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Período da Competição Semanal</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data de Início</Label>
            <Input
              id="startDate"
              type="date"
              value={getDateFromDateTime(formData.startDate)}
              onChange={(e) => {
                const currentTime = getTimeFromDateTime(formData.startDate);
                const combinedDateTime = `${e.target.value}T${currentTime}:00`;
                handleDateChange('startDate', combinedDateTime);
              }}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário de Início
            </Label>
            <Input
              id="startTime"
              type="time"
              value={getTimeFromDateTime(formData.startDate)}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-blue-600">
              🎯 Novo: Defina o horário de início da competição
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">Data de Término</Label>
          <Input
            id="endDate"
            type="date"
            value={getDateFromDateTime(formData.endDate)}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-slate-500">
            Horário de fim: <strong>23:59:59</strong> (automático)
          </p>
        </div>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-700 mb-1">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Horário de Finalização (Automático)</span>
        </div>
        <p className="text-sm text-green-600">
          ⚡ SISTEMA RADICAL: A competição terminará automaticamente às <strong>23:59:59</strong> da data final (Brasília)
        </p>
      </div>
    </div>
  );
};
