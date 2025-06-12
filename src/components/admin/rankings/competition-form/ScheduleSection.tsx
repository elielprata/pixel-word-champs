
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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

  if (competitionType === 'daily') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Agendamento da Competição Diária</h3>
        <div className="space-y-2">
          <Label htmlFor="startDate">Data da Competição</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full"
          />
          <p className="text-sm text-gray-600">
            ⚡ SISTEMA RADICAL: A competição será automaticamente configurada de 00:00:00 às 23:59:59 pelo banco
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Período da Competição Semanal</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Data de Início</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Data de Término</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      <p className="text-sm text-gray-600">
        ⚡ SISTEMA RADICAL: Os horários serão automaticamente configurados (início: 00:00:00, fim: 23:59:59) pelo banco
      </p>
    </div>
  );
};
