
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDailyCompetitionValidation } from '@/hooks/useDailyCompetitionValidation';
import { DailyCompetitionTimeInfo } from './DailyCompetitionTimeInfo';
import { DailyCompetitionFormFields } from './DailyCompetitionFormFields';

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
  newCompetition: any;
  onNewCompetitionChange: (data: any) => void;
  onSubmit: (data: any) => void;
  isEditing: boolean;
  handleStartDateChange?: (date: string) => void;
}

export const DailyCompetitionForm: React.FC<DailyCompetitionFormProps> = ({
  isOpen,
  onOpenChange,
  competition,
  newCompetition,
  onNewCompetitionChange,
  onSubmit,
  isEditing,
  handleStartDateChange
}) => {
  const { validateAndPrepareData, checkExistingDailyCompetition } = useDailyCompetitionValidation();

  // Verificar competição existente quando abrir modal de edição
  useEffect(() => {
    if (isOpen && isEditing && competition) {
      checkExistingDailyCompetition(competition);
    }
  }, [isOpen, isEditing, competition, checkExistingDailyCompetition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('📝 Form: Submetendo dados brutos:', newCompetition || competition);
      
      // Aplicar validação e correção automática
      const dataToSubmit = isEditing ? competition : newCompetition;
      const validatedData = validateAndPrepareData(dataToSubmit);
      
      console.log('✅ Form: Dados validados para submissão:', validatedData);
      
      await onSubmit(validatedData);
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Form: Erro no submit:', error);
    }
  };

  const currentData = isEditing ? competition : newCompetition;

  if (!currentData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Competição Diária' : 'Nova Competição Diária'}
          </DialogTitle>
        </DialogHeader>

        {/* Aviso sobre horários fixos */}
        <DailyCompetitionTimeInfo />

        <form onSubmit={handleSubmit} className="space-y-4">
          <DailyCompetitionFormFields
            currentData={currentData}
            onDataChange={onNewCompetitionChange}
            handleStartDateChange={handleStartDateChange}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {isEditing ? 'Atualizar' : 'Criar'} Competição
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
