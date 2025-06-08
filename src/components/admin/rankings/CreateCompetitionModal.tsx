
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useCompetitions } from "@/hooks/useCompetitions";
import { prizeService } from '@/services/prizeService';
import { CompetitionTypeSection } from './competition-form/CompetitionTypeSection';
import { BasicInfoSection } from './competition-form/BasicInfoSection';
import { CategorySection } from './competition-form/CategorySection';
import { WeeklyTournamentSection } from './competition-form/WeeklyTournamentSection';
import { ParticipantsSection } from './competition-form/ParticipantsSection';
import { ScheduleSection } from './competition-form/ScheduleSection';
import { PrizeSection } from './competition-form/PrizeSection';

interface CreateCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCompetitionModal = ({ open, onOpenChange }: CreateCompetitionModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'weekly' as 'daily' | 'weekly',
    category: 'geral' as string,
    weeklyTournamentId: 'none' as string,
    prizePool: 0,
    maxParticipants: 1000,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrizePool, setTotalPrizePool] = useState(0);
  const { toast } = useToast();
  const { competitions } = useCompetitions();

  // Filtrar competições semanais ativas para seleção
  const weeklyTournaments = competitions.filter(comp => comp.type === 'weekly' && comp.is_active);

  // Buscar configurações de prêmios ativas
  useEffect(() => {
    const fetchPrizeConfigurations = async () => {
      try {
        const configurations = await prizeService.getPrizeConfigurations();
        const activeConfigurations = configurations.filter(config => config.active);
        
        let total = 0;
        
        // Calcular total de prêmios individuais
        const individualPrizes = activeConfigurations.filter(config => config.type === 'individual');
        individualPrizes.forEach(config => {
          total += config.prize_amount;
        });
        
        // Calcular total de prêmios em grupo
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

    if (open) {
      fetchPrizeConfigurations();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implementar criação da competição via API
      console.log('Creating competition:', formData);
      
      toast({
        title: "Competição criada com sucesso!",
        description: `${formData.title} foi criada e está ativa.`,
      });
      
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        type: 'weekly',
        category: 'geral',
        weeklyTournamentId: 'none',
        prizePool: totalPrizePool,
        maxParticipants: 1000,
        startDate: undefined,
        endDate: undefined
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a competição.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPrizeEnabled = formData.type === 'weekly';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-600" />
            Criar Nova Competição
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seção: Configurações Básicas */}
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

          {/* Seção: Configurações Específicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
              <h3 className="text-sm font-medium text-slate-700">Configurações Específicas</h3>
            </div>

            {/* Categoria (apenas para competições diárias) */}
            {formData.type === 'daily' && (
              <CategorySection 
                category={formData.category}
                onCategoryChange={(category) => setFormData(prev => ({ ...prev, category }))}
              />
            )}

            {/* Atribuir a Torneio Semanal (apenas para diárias) */}
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
            startDate={formData.startDate}
            endDate={formData.endDate}
            type={formData.type}
            onStartDateChange={(startDate) => setFormData(prev => ({ ...prev, startDate }))}
            onEndDateChange={(endDate) => setFormData(prev => ({ ...prev, endDate }))}
          />

          {/* Seção: Premiação */}
          {isPrizeEnabled && (
            <PrizeSection totalPrizePool={totalPrizePool} />
          )}

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!formData.title || isSubmitting}
              className="flex-1 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? 'Criando...' : 'Criar Competição'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
