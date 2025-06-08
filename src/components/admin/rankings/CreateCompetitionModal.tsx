import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Trophy, Calendar as CalendarIcon, Users, DollarSign, AlertCircle, Palette } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
    maxParticipants: 1000,
    startDate: undefined as Date | undefined,
    theme: 'default' as 'default' | 'tropical' | 'neon' | 'classic' | 'galaxy' | 'forest'
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
        maxParticipants: 1000,
        startDate: undefined,
        theme: 'default'
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
          icon: CalendarIcon,
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

  const getThemeInfo = () => {
    switch (formData.theme) {
      case 'tropical':
        return { name: 'Tropical', color: 'bg-emerald-500', preview: 'from-emerald-400 to-teal-500' };
      case 'neon':
        return { name: 'Neon', color: 'bg-pink-500', preview: 'from-pink-400 to-violet-500' };
      case 'classic':
        return { name: 'Clássico', color: 'bg-amber-500', preview: 'from-amber-400 to-orange-500' };
      case 'galaxy':
        return { name: 'Galáxia', color: 'bg-indigo-500', preview: 'from-indigo-400 to-purple-600' };
      case 'forest':
        return { name: 'Floresta', color: 'bg-green-600', preview: 'from-green-400 to-emerald-600' };
      default:
        return { name: 'Padrão', color: 'bg-slate-500', preview: 'from-slate-400 to-slate-500' };
    }
  };

  const competitionInfo = getCompetitionInfo();
  const themeInfo = getThemeInfo();
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
                    <CalendarIcon className="h-4 w-4" />
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

          {/* Tema Visual */}
          <div className="space-y-2">
            <Label htmlFor="theme" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Tema Visual
            </Label>
            <Select value={formData.theme} onValueChange={(value: 'default' | 'tropical' | 'neon' | 'classic' | 'galaxy' | 'forest') => setFormData(prev => ({ ...prev, theme: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-slate-400 to-slate-500 rounded"></div>
                    Padrão
                  </div>
                </SelectItem>
                <SelectItem value="tropical">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded"></div>
                    Tropical
                  </div>
                </SelectItem>
                <SelectItem value="neon">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-pink-400 to-violet-500 rounded"></div>
                    Neon
                  </div>
                </SelectItem>
                <SelectItem value="classic">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded"></div>
                    Clássico
                  </div>
                </SelectItem>
                <SelectItem value="galaxy">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-indigo-400 to-purple-600 rounded"></div>
                    Galáxia
                  </div>
                </SelectItem>
                <SelectItem value="forest">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-600 rounded"></div>
                    Floresta
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* Preview do tema selecionado */}
            <div className="bg-slate-50 p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 bg-gradient-to-r ${themeInfo.preview} rounded-lg shadow-sm`}></div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Tema: {themeInfo.name}</p>
                  <p className="text-xs text-slate-500">Este tema será aplicado à interface da competição</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data de Início */}
          <div className="space-y-2">
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? (
                    format(formData.startDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione a data de início</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
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
