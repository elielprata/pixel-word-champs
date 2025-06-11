
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';
import { BasicInfoSection } from './BasicInfoSection';
import { CompetitionTypeSection } from './CompetitionTypeSection';
import { CategorySection } from './CategorySection';
import { ScheduleSection } from './ScheduleSection';
import { ParticipantsSection } from './ParticipantsSection';
import { PrizeSection } from './PrizeSection';
import { FormActions } from './FormActions';

interface CreateCompetitionFormProps {
  onClose: () => void;
  onCompetitionCreated?: () => void;
}

export const CreateCompetitionForm = ({ onClose, onCompetitionCreated }: CreateCompetitionFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'weekly' as 'daily' | 'weekly',
    category: '',
    maxParticipants: 999999,
    prizePool: 185,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    startTime: '00:00',
    endTime: '23:59'
  });

  const createDateTimeFromDateAndTime = (date: Date, time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setUTCHours(hours, minutes, 0, 0);
    return dateTime;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate) {
      toast({
        title: "Erro de validação",
        description: "Por favor, selecione a data de início",
        variant: "destructive"
      });
      return;
    }

    if (formData.type === 'weekly' && !formData.endDate) {
      toast({
        title: "Erro de validação", 
        description: "Por favor, selecione a data de fim para competições semanais",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let startDateTime = createDateTimeFromDateAndTime(formData.startDate, formData.startTime);
      let endDateTime: Date;

      if (formData.type === 'daily') {
        // Para competições diárias, sempre terminar às 23:59:59 do mesmo dia
        endDateTime = new Date(formData.startDate);
        endDateTime.setUTCHours(23, 59, 59, 999);
      } else {
        // Para competições semanais, usar a data e hora especificadas
        endDateTime = createDateTimeFromDateAndTime(formData.endDate!, formData.endTime);
      }

      console.log('📅 Criando competição com horários:', {
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        type: formData.type
      });

      const competitionData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        maxParticipants: formData.maxParticipants,
        prizePool: formData.prizePool,
        startDate: startDateTime,
        endDate: endDateTime
      };

      const response = await customCompetitionService.createCompetition(competitionData);

      if (response.success) {
        toast({
          title: "Competição criada",
          description: `A competição "${formData.title}" foi criada com sucesso.`
        });
        
        onClose();
        if (onCompetitionCreated) {
          onCompetitionCreated();
        }
      } else {
        throw new Error(response.error || 'Erro ao criar competição');
      }
    } catch (error) {
      console.error('Erro ao criar competição:', error);
      toast({
        title: "Erro ao criar competição",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfoSection
        title={formData.title}
        description={formData.description}
        onTitleChange={(title) => setFormData({ ...formData, title })}
        onDescriptionChange={(description) => setFormData({ ...formData, description })}
      />

      <CompetitionTypeSection
        type={formData.type}
        onTypeChange={(type) => setFormData({ ...formData, type })}
      />

      <CategorySection
        category={formData.category}
        type={formData.type}
        onCategoryChange={(category) => setFormData({ ...formData, category })}
      />

      <ScheduleSection
        startDate={formData.startDate}
        endDate={formData.endDate}
        startTime={formData.startTime}
        endTime={formData.endTime}
        type={formData.type}
        onStartDateChange={(startDate) => setFormData({ ...formData, startDate })}
        onEndDateChange={(endDate) => setFormData({ ...formData, endDate })}
        onStartTimeChange={(startTime) => setFormData({ ...formData, startTime })}
        onEndTimeChange={(endTime) => setFormData({ ...formData, endTime })}
      />

      <ParticipantsSection
        maxParticipants={formData.maxParticipants}
        onMaxParticipantsChange={(maxParticipants) => setFormData({ ...formData, maxParticipants })}
      />

      <PrizeSection
        prizePool={formData.prizePool}
        onPrizePoolChange={(prizePool) => setFormData({ ...formData, prizePool })}
      />

      <FormActions
        isSubmitting={isSubmitting}
        hasTitle={!!formData.title}
        onCancel={onClose}
      />
    </form>
  );
};
