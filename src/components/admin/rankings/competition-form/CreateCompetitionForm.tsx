
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';
import { CompetitionTypeSection } from './CompetitionTypeSection';
import { BasicInfoSection } from './BasicInfoSection';
import { ScheduleSection } from './ScheduleSection';
import { ParticipantsSection } from './ParticipantsSection';
import { PrizeConfigurationSection } from './PrizeConfigurationSection';
import { WeeklyTournamentSection } from './WeeklyTournamentSection';
import { FormActions } from './FormActions';
import { usePaymentData } from '@/hooks/usePaymentData';
import { useCustomCompetitions } from '@/hooks/useCustomCompetitions';

interface CreateCompetitionFormProps {
  onClose: () => void;
  onCompetitionCreated?: () => void;
  showPrizeConfig?: boolean;
  showBasicConfig?: boolean;
}

export const CreateCompetitionForm: React.FC<CreateCompetitionFormProps> = ({
  onClose,
  onCompetitionCreated,
  showPrizeConfig = true,
  showBasicConfig = true
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const paymentData = usePaymentData();
  const { customCompetitions } = useCustomCompetitions();

  const [formData, setFormData] = useState({
    type: 'weekly' as 'daily' | 'weekly',
    title: '',
    description: '',
    category: '',
    startDate: '',
    startTime: '08:00', // Campo separado para horário
    endDate: '',
    maxParticipants: 1000,
    weeklyTournamentId: ''
  });

  const handleInputChange = (field: string, value: any) => {
    console.log(`📝 Campo alterado: ${field} =`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🚀 Criando competição com dados:', formData);

      const totalPrizePool = paymentData.calculateTotalPrize();
      
      // Combinar data e horário apenas no momento do envio
      const startDateTime = formData.startDate && formData.startTime 
        ? `${formData.startDate}T${formData.startTime}:00`
        : formData.startDate;
      
      const competitionData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        startDate: startDateTime,
        endDate: formData.endDate,
        prizePool: totalPrizePool,
        maxParticipants: formData.maxParticipants,
        weeklyTournamentId: formData.weeklyTournamentId || undefined
      };

      const result = await customCompetitionService.createCompetition(competitionData);
      
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Competição criada com sucesso.",
        });
        
        if (onCompetitionCreated) {
          onCompetitionCreated();
        }
        onClose();
      } else {
        throw new Error(result.error || 'Erro ao criar competição');
      }
    } catch (error) {
      console.error('❌ Erro ao criar competição:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar a competição",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showBasicConfig && (
        <>
          <CompetitionTypeSection 
            type={formData.type}
            onTypeChange={(type) => handleInputChange('type', type)}
          />

          <BasicInfoSection 
            title={formData.title}
            description={formData.description}
            onTitleChange={(title) => handleInputChange('title', title)}
            onDescriptionChange={(description) => handleInputChange('description', description)}
          />

          <ScheduleSection 
            formData={formData}
            onInputChange={handleInputChange}
            competitionType={formData.type}
          />

          {formData.type === 'weekly' && (
            <>
              <WeeklyTournamentSection 
                weeklyTournamentId={formData.weeklyTournamentId}
                weeklyTournaments={customCompetitions || []}
                onTournamentChange={(tournamentId) => handleInputChange('weeklyTournamentId', tournamentId)}
                competitionType={formData.type}
              />
              
              <ParticipantsSection 
                maxParticipants={formData.maxParticipants}
                onMaxParticipantsChange={(maxParticipants) => handleInputChange('maxParticipants', maxParticipants)}
              />
            </>
          )}

          {formData.type === 'daily' && (
            <WeeklyTournamentSection 
              weeklyTournamentId={formData.weeklyTournamentId}
              weeklyTournaments={customCompetitions || []}
              onTournamentChange={(tournamentId) => handleInputChange('weeklyTournamentId', tournamentId)}
              competitionType={formData.type}
            />
          )}
        </>
      )}

      {showPrizeConfig && formData.type === 'weekly' && (
        <div className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              💰 Configuração de Premiação
            </h3>
            <p className="text-amber-700 text-sm">
              Configure os prêmios individuais e em grupo para a competição semanal. 
              A premiação total será calculada automaticamente.
            </p>
          </div>
          
          <PrizeConfigurationSection paymentData={paymentData} />
        </div>
      )}

      {showPrizeConfig && formData.type === 'daily' && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            🎯 Competição Diária
          </h3>
          <p className="text-blue-700 text-sm">
            Competições diárias não possuem premiação em dinheiro. 
            O foco é na diversão e engajamento dos usuários.
          </p>
        </div>
      )}

      <FormActions 
        isSubmitting={isLoading}
        hasTitle={!!formData.title}
        onCancel={onClose}
      />
    </form>
  );
};
