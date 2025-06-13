
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useCompetitions } from "@/hooks/useCompetitions";
import { prizeService } from '@/services/prizeService';
import { customCompetitionService, CustomCompetitionData } from '@/services/customCompetitionService';
import { usePaymentData } from '@/hooks/usePaymentData';
import { CompetitionTypeSection } from './CompetitionTypeSection';
import { BasicInfoSection } from './BasicInfoSection';
import { WeeklyTournamentSection } from './WeeklyTournamentSection';
import { ParticipantsSection } from './ParticipantsSection';
import { ScheduleSection } from './ScheduleSection';
import { PrizeSection } from './PrizeSection';
import { PrizeConfigurationSection } from './PrizeConfigurationSection';
import { FormActions } from './FormActions';

interface CreateCompetitionFormProps {
  onClose: () => void;
  onCompetitionCreated?: () => void;
}

export const CreateCompetitionForm = ({ onClose, onCompetitionCreated }: CreateCompetitionFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'weekly' as 'daily' | 'weekly',
    weeklyTournamentId: 'none' as string,
    prizePool: 0,
    maxParticipants: 999999,
    startDate: '',
    endDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrizePool, setTotalPrizePool] = useState(0);
  const { toast } = useToast();
  const { customCompetitions, refetch } = useCompetitions();
  const paymentData = usePaymentData();

  const weeklyTournaments = customCompetitions.filter(comp => 
    comp.competition_type === 'tournament' && 
    (comp.status === 'active' || comp.status === 'scheduled')
  );

  useEffect(() => {
    const fetchPrizeConfigurations = async () => {
      try {
        const configurations = await prizeService.getPrizeConfigurations();
        const activeConfigurations = configurations.filter(config => config.active);
        
        let total = 0;
        
        const individualPrizes = activeConfigurations.filter(config => config.type === 'individual');
        individualPrizes.forEach(config => {
          total += config.prize_amount;
        });
        
        const groupPrizes = activeConfigurations.filter(config => config.type === 'group');
        groupPrizes.forEach(config => {
          total += config.prize_amount * config.total_winners;
        });
        
        setTotalPrizePool(total);
        setFormData(prev => ({ ...prev, prizePool: total }));
      } catch (error) {
        console.error('Error fetching prize configurations:', error);
      }
    };

    fetchPrizeConfigurations();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Criando competição sem CategorySection...');
      
      const competitionData: CustomCompetitionData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: 'geral', // Valor padrão fixo
        weeklyTournamentId: formData.weeklyTournamentId !== 'none' ? formData.weeklyTournamentId : undefined,
        prizePool: formData.prizePool,
        maxParticipants: formData.maxParticipants,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      };

      console.log('🎯 Dados enviados:', competitionData);

      const result = await customCompetitionService.createCompetition(competitionData);
      
      if (result.success) {
        toast({
          title: "Competição criada com sucesso!",
          description: `${formData.title} foi criada e está ativa.`,
        });
        
        if (onCompetitionCreated) {
          onCompetitionCreated();
        }
        
        await refetch();
        
        onClose();
        setFormData({
          title: '',
          description: '',
          type: 'weekly',
          weeklyTournamentId: 'none',
          prizePool: totalPrizePool,
          maxParticipants: 999999,
          startDate: '',
          endDate: ''
        });
      } else {
        throw new Error(result.error || 'Erro ao criar competição');
      }
    } catch (error) {
      console.error('❌ Erro ao criar competição:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar a competição.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPrizeEnabled = formData.type === 'weekly';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
          <h3 className="text-sm font-medium text-slate-700">Configurações Básicas</h3>
        </div>

        <CompetitionTypeSection 
          type={formData.type}
          onTypeChange={(type) => setFormData(prev => ({ ...prev, type }))}
        />

        <BasicInfoSection 
          title={formData.title}
          description={formData.description}
          onTitleChange={(title) => setFormData(prev => ({ ...prev, title }))}
          onDescriptionChange={(description) => setFormData(prev => ({ ...prev, description }))}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
          <h3 className="text-sm font-medium text-slate-700">Configurações Específicas</h3>
        </div>

        {formData.type === 'daily' && (
          <WeeklyTournamentSection 
            weeklyTournamentId={formData.weeklyTournamentId}
            weeklyTournaments={weeklyTournaments}
            onTournamentChange={(weeklyTournamentId) => setFormData(prev => ({ ...prev, weeklyTournamentId }))}
          />
        )}

        <ParticipantsSection 
          maxParticipants={formData.maxParticipants}
          onMaxParticipantsChange={(maxParticipants) => setFormData(prev => ({ ...prev, maxParticipants }))}
        />
      </div>

      <ScheduleSection 
        formData={formData}
        onInputChange={handleInputChange}
        competitionType={formData.type}
      />

      {isPrizeEnabled && (
        <>
          <PrizeSection totalPrizePool={totalPrizePool} />
          <PrizeConfigurationSection paymentData={paymentData} />
        </>
      )}

      <FormActions 
        isSubmitting={isSubmitting}
        hasTitle={!!formData.title}
        onCancel={onClose}
      />
    </form>
  );
};
