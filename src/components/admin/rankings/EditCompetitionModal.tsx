
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditCompetitionForm } from './edit-competition/EditCompetitionForm';

interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
  competition_type?: string;
}

interface EditCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competition: WeeklyCompetition | null;
  onCompetitionUpdated?: () => void;
}

export const EditCompetitionModal: React.FC<EditCompetitionModalProps> = ({
  open,
  onOpenChange,
  competition,
  onCompetitionUpdated
}) => {
  const handleClose = () => onOpenChange(false);

  // Determinar o tipo de competição para o título correto
  const getCompetitionTypeTitle = () => {
    if (!competition) return "Editar Competição";
    
    // Se tem competition_type, usar esse campo
    if (competition.competition_type === 'challenge') {
      return "Editar Competição Diária";
    } else if (competition.competition_type === 'tournament') {
      return "Editar Competição Semanal";
    }
    
    // Fallback: tentar detectar pelo padrão de datas
    const startDate = new Date(competition.start_date);
    const endDate = new Date(competition.end_date);
    const diffInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Se a duração é de 1 dia ou menos, provavelmente é diária
    if (diffInDays <= 1) {
      return "Editar Competição Diária";
    }
    
    // Caso contrário, assumir que é semanal
    return "Editar Competição Semanal";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getCompetitionTypeTitle()}</DialogTitle>
        </DialogHeader>

        <EditCompetitionForm 
          competition={competition}
          onClose={handleClose}
          onCompetitionUpdated={onCompetitionUpdated}
        />
      </DialogContent>
    </Dialog>
  );
};
