import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimePickerSection } from './TimePickerSection';

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
    max_participants: number;
  };
  onNewCompetitionChange: (competition: any) => void;
  onSubmit: () => void;
  isEditing: boolean;
  handleStartDateChange: (value: string) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
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
  startTime,
  onStartTimeChange
}) => {
  const currentData = isEditing ? competition : newCompetition;
  
  if (!currentData) return null;

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
                  value={competition?.max_participants || 500}
                  onChange={(e) => onNewCompetitionChange({...competition, max_participants: parseInt(e.target.value)})}
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data {isEditing ? 'da Competição' : 'do Desafio'}</Label>
              <Input 
                type="date"
                value={currentData.start_date.split('T')[0]}
                onChange={(e) => isEditing 
                  ? handleStartDateChange(e.target.value)
                  : handleStartDateChange(e.target.value)
                }
              />
            </div>
            {!isEditing && (
              <TimePickerSection
                startTime={startTime}
                onStartTimeChange={onStartTimeChange}
              />
            )}
          </div>
          <p className="text-xs text-green-600 mt-1 font-medium">
            ✅ {isEditing ? 'Será automaticamente configurada' : 'Competição será ativa'} das {!isEditing ? startTime || '00:00:00' : '00:00:00'} às 23:59:59{isEditing ? '' : ' desta data (PADRÃO)'}
          </p>
          {!isEditing && (
            <div>
              <Label>Máx. Participantes</Label>
              <Input 
                type="number"
                value={newCompetition.max_participants}
                onChange={(e) => onNewCompetitionChange({...newCompetition, max_participants: parseInt(e.target.value)})}
              />
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
