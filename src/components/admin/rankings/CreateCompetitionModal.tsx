import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';

interface CreateCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompetitionCreated?: () => void;
}

interface FormData {
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  category: string;
  weeklyTournamentId: string;
  prizePool: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
}

export const CreateCompetitionModal: React.FC<CreateCompetitionModalProps> = ({
  open,
  onOpenChange,
  onCompetitionCreated
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'weekly',
    category: '',
    weeklyTournamentId: '',
    prizePool: 0,
    maxParticipants: 100,
    startDate: '',
    endDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('📝 Enviando dados da competição:', formData);

      const competitionData = {
        title: formData.title,
        description: formData.description,
        type: formData.type as 'daily' | 'weekly',
        category: formData.category,
        weeklyTournamentId: formData.weeklyTournamentId,
        prizePool: formData.prizePool,
        maxParticipants: formData.maxParticipants,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined
      };

      const response = await customCompetitionService.createCompetition(competitionData);

      if (response.success) {
        console.log('✅ Competição criada com sucesso');
        toast({
          title: "Competição criada com sucesso!",
          description: `A competição "${formData.title}" foi criada e está disponível.`,
        });

        // Reset form
        setFormData({
          title: '',
          description: '',
          type: 'weekly',
          category: '',
          weeklyTournamentId: '',
          prizePool: 0,
          maxParticipants: 100,
          startDate: '',
          endDate: ''
        });

        // Close modal
        onOpenChange(false);

        // Trigger refresh callback to update the rankings list
        if (onCompetitionCreated) {
          console.log('🔄 Chamando callback para atualizar lista...');
          onCompetitionCreated();
        }
      } else {
        throw new Error(response.error || 'Erro ao criar competição');
      }
    } catch (error) {
      console.error('❌ Erro ao criar competição:', error);
      toast({
        title: "Erro ao criar competição",
        description: error instanceof Error ? error.message : "Não foi possível criar a competição. Tente novamente.",
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
          <DialogTitle>Criar Competição</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              type="text"
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

          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as 'daily' | 'weekly' })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="weeklyTournamentId">ID do Torneio Semanal</Label>
            <Input
              id="weeklyTournamentId"
              type="text"
              value={formData.weeklyTournamentId}
              onChange={(e) => setFormData({ ...formData, weeklyTournamentId: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prizePool">Pool de Prêmios</Label>
              <Input
                id="prizePool"
                type="number"
                value={String(formData.prizePool)}
                onChange={(e) => setFormData({ ...formData, prizePool: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="maxParticipants">Máximo de Participantes</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={String(formData.maxParticipants)}
                onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endDate">Data de Fim</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
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
              {isLoading ? "Criando..." : "Criar Competição"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
