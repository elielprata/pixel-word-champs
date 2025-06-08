
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar as CalendarIcon } from 'lucide-react';

interface CompetitionTypeSectionProps {
  type: 'daily' | 'weekly';
  onTypeChange: (type: 'daily' | 'weekly') => void;
}

export const CompetitionTypeSection = ({ type, onTypeChange }: CompetitionTypeSectionProps) => {
  const getCompetitionInfo = () => {
    switch (type) {
      case 'daily':
        return {
          icon: CalendarIcon,
          color: 'bg-blue-500',
          info: 'Competições diárias não possuem premiação. Os pontos são transferidos para o ranking semanal.',
          label: 'Diária'
        };
      case 'weekly':
        return {
          icon: Trophy,
          color: 'bg-purple-500',
          info: 'Competições semanais possuem premiação baseada na posição final.',
          label: 'Semanal'
        };
      default:
        return {
          icon: Trophy,
          color: 'bg-gray-500',
          info: '',
          label: ''
        };
    }
  };

  const competitionInfo = getCompetitionInfo();
  const CompetitionIcon = competitionInfo.icon;

  return (
    <div className="space-y-1">
      <Label htmlFor="type" className="text-sm">Tipo de Competição</Label>
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="h-8">
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-3 w-3" />
              Competição Diária
            </div>
          </SelectItem>
          <SelectItem value="weekly">
            <div className="flex items-center gap-2">
              <Trophy className="h-3 w-3" />
              Competição Semanal
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      {/* Informações sobre o tipo selecionado */}
      <div className="bg-slate-50 p-2 rounded border">
        <div className="flex items-start gap-2">
          <div className={`${competitionInfo.color} p-1 rounded`}>
            <CompetitionIcon className="h-3 w-3 text-white" />
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="text-xs mb-1">
              {competitionInfo.label}
            </Badge>
            <p className="text-xs text-slate-600">{competitionInfo.info}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
