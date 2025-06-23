
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';
import { CompetitionEditActions } from './CompetitionEditActions';
import { PrizeConfigurationSection } from '../competition-form/PrizeConfigurationSection';
import { usePaymentData } from '@/hooks/usePaymentData';

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

interface EditCompetitionFormProps {
  competition: BaseCompetition | null;
  onClose: () => void;
  onCompetitionUpdated?: () => void;
}

export const EditCompetitionForm: React.FC<EditCompetitionFormProps> = ({
  competition,
  onClose,
  onCompetitionUpdated
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const paymentData = usePaymentData();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    if (competition) {
      console.log('📝 Carregando dados da competição para edição:', {
        id: competition.id,
        title: competition.title,
        originalStartDate: competition.start_date,
        originalEndDate: competition.end_date,
        originalStatus: competition.status
      });
      
      setFormData({
        title: competition.title,
        description: competition.description || '',
        start_date: competition.start_date,
        end_date: competition.end_date
      });
    }
  }, [competition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competition) return;

    setIsLoading(true);
    try {
      console.log('💾 Salvando alterações da competição:', {
        id: competition.id,
        preservedStartDate: formData.start_date,
        preservedEndDate: formData.end_date,
        newTitle: formData.title,
        newDescription: formData.description
      });

      const competitionType = competition.theme ? 'challenge' : competition.competition_type === 'challenge' ? 'challenge' : 'tournament';

      // Calcular premiação total automaticamente
      const totalPrizePool = paymentData.calculateTotalPrize();
      
      const updateData = {
        title: formData.title,
        description: formData.description,
        competition_type: competitionType,
        start_date: formData.start_date,
        end_date: formData.end_date,
        prize_pool: totalPrizePool,
        ...(competition.theme && { theme: competition.theme })
      };

      const response = await customCompetitionService.updateCompetition(competition.id, updateData);
      
      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Competição atualizada com sucesso"
        });
        if (onCompetitionUpdated) {
          onCompetitionUpdated();
        }
        onClose();
      } else {
        throw new Error(response.error || 'Erro ao atualizar competição');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar competição:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar a competição",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!competition) return null;

  const isDailyCompetition = competition.theme || competition.competition_type === 'challenge';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        {!isDailyCompetition && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <Label className="text-sm font-medium text-green-800">Configurações Automáticas</Label>
            <div className="text-sm text-green-700 mt-1 space-y-1">
              <p>💰 Premiação Total: R$ {paymentData.calculateTotalPrize().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p>🎯 Participação: Livre (todos os usuários podem participar)</p>
              <p className="text-xs text-green-600 mt-1">
                💡 A premiação é calculada automaticamente com base na configuração de prêmios abaixo
              </p>
            </div>
          </div>
        )}
      </div>

      {!isDailyCompetition && <PrizeConfigurationSection paymentData={paymentData} />}

      <CompetitionEditActions isLoading={isLoading} onCancel={onClose} />
    </form>
  );
};
