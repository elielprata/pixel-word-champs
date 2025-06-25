
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { unifiedCompetitionService } from '@/services/unifiedCompetitionService';
import { CompetitionEditActions } from './CompetitionEditActions';
import { PrizeConfigurationSection } from '../competition-form/PrizeConfigurationSection';
import { usePaymentData } from '@/hooks/usePaymentData';
import { formatUTCForDateTimeLocal } from '@/utils/brasiliaTimeUnified';

interface BaseCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants?: number;
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
    startDate: '',
    endDate: ''
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
      
      // Converter UTC para datetime-local (Brasília)
      const startDateLocal = formatUTCForDateTimeLocal(competition.start_date);
      const endDateLocal = formatUTCForDateTimeLocal(competition.end_date);
      
      setFormData({
        title: competition.title,
        description: competition.description || '',
        startDate: startDateLocal,
        endDate: endDateLocal
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
        newTitle: formData.title,
        newDescription: formData.description,
        newStartDate: formData.startDate,
        newEndDate: formData.endDate
      });

      // Corrigir verificação do tipo de competição
      const isDailyCompetition = competition.theme !== null || competition.competition_type === 'challenge';

      if (isDailyCompetition) {
        // Para competições diárias, usar o serviço unificado
        const updateData = {
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate,  // Será convertido para UTC no serviço
          maxParticipants: 0
        };

        const response = await unifiedCompetitionService.updateCompetition(competition.id, updateData);
        
        if (response.success) {
          toast({
            title: "Sucesso",
            description: "Competição diária atualizada com sucesso"
          });
          if (onCompetitionUpdated) {
            onCompetitionUpdated();
          }
          onClose();
        } else {
          throw new Error(response.error || 'Erro ao atualizar competição');
        }
      } else {
        // Para competições semanais, manter lógica existente
        toast({
          title: "Aviso",
          description: "Edição de competições semanais ainda não implementada neste contexto",
          variant: "destructive"
        });
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

  const isDailyCompetition = competition.theme !== null || competition.competition_type === 'challenge';

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Data e Hora de Início</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
            />
            <p className="text-xs text-blue-600 mt-1">
              🇧🇷 Horário de Brasília
            </p>
          </div>

          <div>
            <Label htmlFor="endDate">Data e Hora de Fim</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              required
              disabled={isDailyCompetition}
            />
            {isDailyCompetition && (
              <p className="text-xs text-green-600 mt-1">
                ⚙️ Calculado automaticamente baseado na duração
              </p>
            )}
          </div>
        </div>

        {isDailyCompetition && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <Label className="text-sm font-medium text-green-800">Configurações Automáticas</Label>
            <div className="text-sm text-green-700 mt-1 space-y-1">
              <p>💰 Premiação: Sem prêmios em dinheiro</p>
              <p>🎯 Participação: Livre (todos os usuários podem participar)</p>
              <p>⏰ Horários: Exibição em Brasília, processamento em UTC</p>
              <p className="text-xs text-green-600 mt-1">
                💡 Competições diárias focam no engajamento dos usuários
              </p>
            </div>
          </div>
        )}

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
