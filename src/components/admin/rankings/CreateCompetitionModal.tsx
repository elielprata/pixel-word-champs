
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, DollarSign, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CreateCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCompetitionModal = ({ open, onOpenChange }: CreateCompetitionModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'weekly' as 'daily' | 'weekly' | 'challenge',
    prizePool: 0,
    maxParticipants: 1000
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
        prizePool: 0,
        maxParticipants: 1000
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

  const getCompetitionInfo = () => {
    switch (formData.type) {
      case 'daily':
        return {
          icon: Calendar,
          color: 'bg-blue-500',
          info: 'Competições diárias não possuem premiação. Os pontos são transferidos para o ranking semanal.',
          prizeEnabled: false
        };
      case 'weekly':
        return {
          icon: Trophy,
          color: 'bg-purple-500',
          info: 'Competições semanais possuem premiação baseada na posição final.',
          prizeEnabled: true
        };
      case 'challenge':
        return {
          icon: Users,
          color: 'bg-orange-500',
          info: 'Desafios especiais com regras customizadas e premiação opcional.',
          prizeEnabled: true
        };
      default:
        return {
          icon: Trophy,
          color: 'bg-gray-500',
          info: '',
          prizeEnabled: false
        };
    }
  };

  const competitionInfo = getCompetitionInfo();
  const CompetitionIcon = competitionInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-600" />
            Criar Nova Competição
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Competição */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Competição</Label>
            <Select value={formData.type} onValueChange={(value: 'daily' | 'weekly' | 'challenge') => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Competição Diária
                  </div>
                </SelectItem>
                <SelectItem value="weekly">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Competição Semanal
                  </div>
                </SelectItem>
                <SelectItem value="challenge">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Desafio Especial
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* Info sobre o tipo selecionado */}
            <div className="bg-slate-50 p-3 rounded-lg border">
              <div className="flex items-start gap-3">
                <div className={`${competitionInfo.color} p-2 rounded-lg`}>
                  <CompetitionIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {formData.type === 'daily' ? 'Diária' : formData.type === 'weekly' ? 'Semanal' : 'Especial'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{competitionInfo.info}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título da Competição</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Torneio de Palavras Semanal"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva as regras e objetivos da competição..."
              rows={3}
            />
          </div>

          {/* Prêmio (apenas para semanal e challenge) */}
          {competitionInfo.prizeEnabled && (
            <div className="space-y-2">
              <Label htmlFor="prizePool" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor Total dos Prêmios (R$)
              </Label>
              <Input
                id="prizePool"
                type="number"
                min="0"
                step="0.01"
                value={formData.prizePool}
                onChange={(e) => setFormData(prev => ({ ...prev, prizePool: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          )}

          {/* Alerta para competição diária */}
          {formData.type === 'daily' && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Informação Importante</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Competições diárias não possuem premiação. Os pontos dos participantes são automaticamente 
                transferidos para o ranking semanal ao final de cada dia.
              </p>
            </div>
          )}

          {/* Máximo de Participantes */}
          <div className="space-y-2">
            <Label htmlFor="maxParticipants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Máximo de Participantes
            </Label>
            <Input
              id="maxParticipants"
              type="number"
              min="1"
              value={formData.maxParticipants}
              onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 1000 }))}
              placeholder="1000"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!formData.title || isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? 'Criando...' : 'Criar Competição'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
