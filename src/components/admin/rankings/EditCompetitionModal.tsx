
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditCompetitionForm } from './edit-competition/EditCompetitionForm';

interface BaseCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants?: number; // Made optional to match WeeklyCompetition
  competition_type?: string;
  theme?: string;
  rules?: any;
}

interface EditCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competition: BaseCompetition | null;
  onCompetitionUpdated?: () => void;
}

export const EditCompetitionModal: React.FC<EditCompetitionModalProps> = ({
  open,
  onOpenChange,
  competition,
  onCompetitionUpdated
}) => {
  console.log('🎭 EditCompetitionModal - Props recebidas:', {
    open,
    competition: competition?.id,
    competitionTitle: competition?.title
  });

  const handleClose = () => {
    console.log('🎭 EditCompetitionModal - Fechando modal');
    onOpenChange(false);
  };

  const getCompetitionTypeTitle = () => {
    if (!competition) return "Editar Competição";
    
    if ('theme' in competition) {
      return "Editar Competição Diária";
    }
    
    if (competition.competition_type === 'challenge') {
      return "Editar Competição Diária";
    } else if (competition.competition_type === 'tournament') {
      return "Editar Competição Semanal";
    }
    
    const startDate = new Date(competition.start_date);
    const endDate = new Date(competition.end_date);
    const diffInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays <= 1) {
      return "Editar Competição Diária";
    }
    
    return "Editar Competição Semanal";
  };

  // Determinar se precisa de modal maior para configuração de prêmios
  const isDailyCompetition = competition?.theme || competition?.competition_type === 'challenge';
  const modalSize = isDailyCompetition ? "max-w-2xl" : "max-w-6xl";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${modalSize} max-h-[90vh] overflow-y-auto`}>
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
