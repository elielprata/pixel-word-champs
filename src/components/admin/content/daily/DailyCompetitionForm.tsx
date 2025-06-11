
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimePickerSection } from '../../rankings/competition-form/TimePickerSection';

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
  newCompetition: {
    title: string;
    description: string;
    theme: string;
    start_date: string;
    end_date: string;
    start_time: string;
    max_participants: number;
  };
  onNewCompetitionChange: (competition: any) => void;
  onSubmit: () => void;
  isEditing: boolean;
  handleStartDateChange: (value: string) => void;
  handleStartTimeChange: (value: string) => void;
}

const themes = [
  'Animais',
  'Profissões',
  'Esportes',
  'Comidas',
  'Países',
  'Cores',
  'Natureza',
  'Tecnologia',
  'Música',
  'Cinema',
  'Literatura',
  'História',
  'Ciência',
  'Geografia'
];

export const DailyCompetitionForm: React.FC<DailyCompetitionFormProps> = ({
  isOpen,
  onOpenChange,
  competition,
  newCompetition,
  onNewCompetitionChange,
  onSubmit,
  isEditing,
  handleStartDateChange,
  handleStartTimeChange
}) => {
  const currentData = isEditing ? competition : newCompetition;
  
  if (!currentData) return null;

  const getTimeFromDate = (dateString: string): string => {
    if (!dateString) return '00:00';
    const date = new Date(dateString);
    return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
  };

  const getDateFromDateTime = (dateString: string): string => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Competição Diária' : 'Criar Nova Competição Diária'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <Label>Título</Label>
            <Input 
              value={currentData.title}
              onChange={(e) => isEditing 
                ? onNewCompetitionChange({...competition, title: e.target.value})
                : onNewCompetitionChange({...newCompetition, title: e.target.value})
              }
              placeholder="Ex: Desafio Diário - Animais"
            />
          </div>
          <div>
            <Label>Tema</Label>
            <Select 
              value={currentData.theme} 
              onValueChange={(value) => isEditing
                ? onNewCompetitionChange({...competition, theme: value})
                : onNewCompetitionChange({...newCompetition, theme: value})
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tema" />
              </SelectTrigger>
              <SelectContent>
                {themes.map(theme => (
                  <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea 
              value={currentData.description}
              onChange={(e) => isEditing
                ? onNewCompetitionChange({...competition, description: e.target.value})
                : onNewCompetitionChange({...newCompetition, description: e.target.value})
              }
              placeholder="Descreva o desafio diário..."
              rows={3}
            />
          </div>
          {isEditing && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select 
                  value={competition?.status || 'draft'} 
                  onValueChange={(value) => onNewCompetitionChange({...competition, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="completed">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Máx. Participantes</Label>
                <Input 
                  type="number"
                  value={competition?.max_participants || 0}
                  onChange={(e) => onNewCompetitionChange({...competition, max_participants: parseInt(e.target.value)})}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-green-600 mt-1">Participação livre (ilimitado)</p>
              </div>
            </div>
          )}
          <div>
            <Label>Data da Competição</Label>
            <Input 
              type="date"
              value={getDateFromDateTime(currentData.start_date)}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>
          <div>
            <TimePickerSection
              label="Horário de Início"
              value={isEditing ? getTimeFromDate(currentData.start_date) : (newCompetition.start_time || '00:00')}
              onChange={handleStartTimeChange}
              defaultTime="00:00"
            />
            <p className="text-xs text-green-600 mt-1 font-medium">
              ✅ Competição será ativa do horário escolhido até 23:59:59 do mesmo dia
            </p>
          </div>
          {!isEditing && (
            <div>
              <Label>Máx. Participantes</Label>
              <Input 
                type="number"
                value={0}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-green-600 mt-1">Participação livre (ilimitado)</p>
            </div>
          )}
          <Button onClick={onSubmit} className="w-full">
            {isEditing ? 'Salvar Alterações' : 'Criar Competição Diária'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
