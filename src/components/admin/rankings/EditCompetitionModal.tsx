
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';

interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
}

interface EditCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competition: WeeklyCompetition | null;
  onCompetitionUpdated?: () => void;
}

export const EditCompetitionModal: React.FC<EditCompetitionModalProps> = ({
  open,
  onOpenChange,
  competition,
  onCompetitionUpdated
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (competition) {
      const startDate = new Date(competition.start_date);
      const endDate = new Date(competition.end_date);
      
      const startDateFormatted = startDate.toISOString().split('T')[0];
      const endDateFormatted = endDate.toISOString().split('T')[0];
      
      setFormData({
        title: competition.title,
        description: competition.description,
        startDate: startDateFormatted,
        endDate: endDateFormatted
      });
    }
  }, [competition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competition) return;

    setIsLoading(true);

    try {
      const startDateWithTime = new Date(formData.startDate);
      startDateWithTime.setHours(0, 0, 0, 0);
      
      const endDateWithTime = new Date(formData.endDate);
      endDateWithTime.setHours(23, 59, 59, 999);

      const updateData = {
        title: formData.title,
        description: formData.description,
        start_date: startDateWithTime.toISOString(),
        end_date: endDateWithTime.toISOString(),
        max_participants: 999999, // Set high number for unlimited participation
        competition_type: 'tournament'
      };

      const response = await customCompetitionService.updateCompetition(competition.id, updateData);

      if (response.success) {
        toast({
          title: "Competição atualizada",
          description: "As alterações foram salvas com sucesso.",
        });
        
        onOpenChange(false);
        if (onCompetitionUpdated) {
          onCompetitionUpdated();
        }
      } else {
        throw new Error(response.error || 'Erro ao atualizar competição');
      }
    } catch (error) {
      console.error('Erro ao atualizar competição:', error);
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Não foi possível atualizar a competição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Competição Semanal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <p className="text-xs text-slate-500 mt-1">Horário: 00:00:00 (Brasília)</p>
            </div>

            <div>
              <Label htmlFor="endDate">Data de Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
              <p className="text-xs text-slate-500 mt-1">Horário: 23:59:59 (Brasília)</p>
            </div>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm font-medium text-green-700">Participação Livre</p>
            <p className="text-xs text-green-600">Todos os usuários podem participar sem restrições</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
