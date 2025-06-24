
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { unifiedCompetitionService } from '@/services/unifiedCompetitionService';
import { CompetitionTypeSection } from './CompetitionTypeSection';
import { BasicInfoSection } from './BasicInfoSection';
import { ScheduleSection } from './ScheduleSection';
import { ParticipantsSection } from './ParticipantsSection';
import { PrizeConfigurationSection } from './PrizeConfigurationSection';
import { WeeklyTournamentSection } from './WeeklyTournamentSection';
import { FormActions } from './FormActions';
import { usePaymentData } from '@/hooks/usePaymentData';
import { useUnifiedCompetitions } from '@/hooks/useUnifiedCompetitions';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { secureLogger } from '@/utils/secureLogger';

interface CreateCompetitionFormProps {
  onClose: () => void;
  onCompetitionCreated?: () => void;
  showPrizeConfig?: boolean;
  showBasicConfig?: boolean;
  onCompetitionTypeChange?: (type: 'daily' | 'weekly') => void;
  onError?: (error: string) => void;
}

export const CreateCompetitionForm: React.FC<CreateCompetitionFormProps> = ({
  onClose,
  onCompetitionCreated,
  showPrizeConfig = true,
  showBasicConfig = true,
  onCompetitionTypeChange,
  onError
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Hooks com tratamento de erro
  const paymentData = usePaymentData();
  const { competitions, isLoading: competitionsLoading, error: competitionsError } = useUnifiedCompetitions();

  const [formData, setFormData] = useState({
    type: 'weekly' as 'daily' | 'weekly',
    title: '',
    description: '',
    category: '',
    startDate: '',
    startTime: '08:00',
    endDate: '',
    maxParticipants: 1000,
    weeklyTournamentId: ''
  });

  // Log de inicialização do componente
  React.useEffect(() => {
    secureLogger.debug('CreateCompetitionForm inicializado', { 
      showPrizeConfig, 
      showBasicConfig,
      paymentDataLoading: paymentData.isLoading,
      competitionsLoading,
      competitionsError
    }, 'CREATE_COMPETITION_FORM');
  }, [showPrizeConfig, showBasicConfig, paymentData.isLoading, competitionsLoading, competitionsError]);

  // Tratar erros dos hooks
  React.useEffect(() => {
    if (competitionsError && onError) {
      onError(`Erro ao carregar competições: ${competitionsError}`);
    }
  }, [competitionsError, onError]);

  const handleInputChange = (field: string, value: any) => {
    secureLogger.debug(`Campo alterado: ${field}`, { value }, 'CREATE_COMPETITION_FORM');
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'type' && onCompetitionTypeChange) {
      onCompetitionTypeChange(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    try {
      secureLogger.debug('Iniciando criação de competição', { formData }, 'CREATE_COMPETITION_FORM');

      const startDateTime = formData.startDate && formData.startTime 
        ? `${formData.startDate}T${formData.startTime}:00`
        : formData.startDate;
      
      const competitionData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        startDate: startDateTime,
        endDate: formData.endDate,
        maxParticipants: formData.maxParticipants,
        weeklyTournamentId: formData.weeklyTournamentId || undefined
      };

      secureLogger.debug('Dados da competição preparados', { competitionData }, 'CREATE_COMPETITION_FORM');

      const result = await unifiedCompetitionService.createCompetition(competitionData);
      
      if (result.success) {
        secureLogger.debug('Competição criada com sucesso', { competitionId: result.data?.id }, 'CREATE_COMPETITION_FORM');
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
      const errorMessage = error instanceof Error ? error.message : "Não foi possível criar a competição";
      secureLogger.error('Erro ao criar competição', { error: errorMessage }, 'CREATE_COMPETITION_FORM');
      
      setLocalError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (paymentData.isLoading || competitionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-sm text-gray-600">Carregando dados necessários...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (localError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {localError}
          </AlertDescription>
        </Alert>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setLocalError(null)}>
            Tentar Novamente
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  const weeklyTournaments = competitions.filter(c => c.type === 'weekly');

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
            <ParticipantsSection 
              maxParticipants={formData.maxParticipants}
              onMaxParticipantsChange={(maxParticipants) => handleInputChange('maxParticipants', maxParticipants)}
            />
          )}

          {formData.type === 'daily' && (
            <WeeklyTournamentSection 
              weeklyTournamentId={formData.weeklyTournamentId}
              weeklyTournaments={weeklyTournaments}
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
