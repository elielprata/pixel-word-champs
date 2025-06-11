
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';
import { CompetitionEditActions } from './CompetitionEditActions';

interface BaseCompetition {
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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: '',
    start_date: '',
    end_date: '',
    prize_pool: 0,
    max_participants: 0
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
        theme: competition.theme || '',
        // IMPORTANTE: Preservar as datas exatas da competição original
        start_date: competition.start_date,
        end_date: competition.end_date,
        prize_pool: competition.prize_pool || 0,
        max_participants: competition.max_participants || 0
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

      // Determinar o tipo de competição
      const competitionType = competition.theme ? 'challenge' : 
                             competition.competition_type === 'challenge' ? 'challenge' : 'tournament';

      const updateData = {
        title: formData.title,
        description: formData.description,
        competition_type: competitionType,
        // PRESERVAR as datas originais sem alteração
        start_date: formData.start_date,
        end_date: formData.end_date,
        prize_pool: formData.prize_pool,
        max_participants: formData.max_participants,
        ...(competition.theme && { theme: formData.theme })
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

  // Determinar se é competição diária
  const isDailyCompetition = competition.theme || competition.competition_type === 'challenge';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
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

        {isDailyCompetition && (
          <div>
            <Label htmlFor="theme">Tema</Label>
            <Input
              id="theme"
              value={formData.theme}
              onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
              placeholder="Ex: Natureza, Tecnologia, Esportes..."
            />
          </div>
        )}

        {/* Exibir informações das datas como read-only para competições diárias */}
        {isDailyCompetition && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <Label className="text-sm font-medium text-blue-800">Período da Competição</Label>
            <div className="text-sm text-blue-700 mt-1">
              <p>Data: {new Date(formData.start_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
              <p>Horário: 00:00 às 23:59 (Horário de Brasília)</p>
              <p className="text-xs text-blue-600 mt-1">
                💡 As datas das competições diárias não podem ser alteradas durante a edição
              </p>
            </div>
          </div>
        )}

        {!isDailyCompetition && (
          <>
            <div>
              <Label htmlFor="prize_pool">Premiação (R$)</Label>
              <Input
                id="prize_pool"
                type="number"
                value={formData.prize_pool}
                onChange={(e) => setFormData(prev => ({ ...prev, prize_pool: Number(e.target.value) }))}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="max_participants">Máximo de Participantes</Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData(prev => ({ ...prev, max_participants: Number(e.target.value) }))}
                min="0"
              />
            </div>
          </>
        )}
      </div>

      <CompetitionEditActions
        isLoading={isLoading}
        onCancel={onClose}
      />
    </form>
  );
};
