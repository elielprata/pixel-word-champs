
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Trophy, Calendar as CalendarIcon, Users, DollarSign, Tag, Link } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCompetitions } from "@/hooks/useCompetitions";
import { prizeService } from '@/services/prizeService';

interface CreateCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCompetitionModal = ({ open, onOpenChange }: CreateCompetitionModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'weekly' as 'daily' | 'weekly' | 'challenge',
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

  const categories = [
    { value: 'geral', label: 'Geral', description: 'Palavras diversas de todos os temas' },
    { value: 'animais', label: 'Animais', description: 'Palavras relacionadas a fauna' },
    { value: 'cores', label: 'Cores', description: 'Nomes de cores e tonalidades' },
    { value: 'comidas', label: 'Comidas', description: 'Alimentos e bebidas' },
    { value: 'profissoes', label: 'Profissões', description: 'Carreiras e ocupações' },
    { value: 'esportes', label: 'Esportes', description: 'Modalidades esportivas' },
    { value: 'paises', label: 'Países', description: 'Nações do mundo' },
    { value: 'objetos', label: 'Objetos', description: 'Itens do cotidiano' },
    { value: 'natureza', label: 'Natureza', description: 'Elementos naturais' },
    { value: 'tecnologia', label: 'Tecnologia', description: 'Termos tecnológicos' }
  ];

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

  const competitionInfo = getCompetitionInfo();
  const CompetitionIcon = competitionInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-600" />
            Criar Nova Competição
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Tipo de Competição */}
          <div className="space-y-1">
            <Label htmlFor="type" className="text-sm">Tipo de Competição</Label>
            <Select value={formData.type} onValueChange={(value: 'daily' | 'weekly' | 'challenge') => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-3 w-3" />
                    Competição Diária
                  </div>
                </SelectItem>
                <SelectItem value="weekly">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3 w-3" />
                    Competição Semanal
                  </div>
                </SelectItem>
                <SelectItem value="challenge">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Desafio Especial
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* Info sobre o tipo selecionado */}
            <div className="bg-slate-50 p-2 rounded border">
              <div className="flex items-start gap-2">
                <div className={`${competitionInfo.color} p-1 rounded`}>
                  <CompetitionIcon className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1">
                  <Badge variant="outline" className="text-xs mb-1">
                    {formData.type === 'daily' ? 'Diária' : formData.type === 'weekly' ? 'Semanal' : 'Especial'}
                  </Badge>
                  <p className="text-xs text-slate-600">{competitionInfo.info}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Categoria (apenas para competições diárias) */}
          {formData.type === 'daily' && (
            <div className="space-y-1">
              <Label htmlFor="category" className="flex items-center gap-2 text-sm">
                <Tag className="h-3 w-3" />
                Categoria das Palavras
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{category.label}</span>
                        <span className="text-xs text-slate-500">{category.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Atribuir a Torneio Semanal (apenas para competições diárias) */}
          {formData.type === 'daily' && (
            <div className="space-y-1">
              <Label htmlFor="weeklyTournament" className="flex items-center gap-2 text-sm">
                <Link className="h-3 w-3" />
                Atribuir a Torneio Semanal
              </Label>
              <Select value={formData.weeklyTournamentId} onValueChange={(value) => setFormData(prev => ({ ...prev, weeklyTournamentId: value }))}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Selecione um torneio semanal (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-slate-500">Nenhum torneio selecionado</span>
                  </SelectItem>
                  {weeklyTournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{tournament.title}</span>
                        <span className="text-xs text-slate-500">
                          {tournament.total_participants} participantes • R$ {tournament.prize_pool}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-600">
                Os pontos desta competição diária contribuirão para o torneio semanal selecionado.
              </p>
            </div>
          )}

          {/* Título */}
          <div className="space-y-1">
            <Label htmlFor="title" className="text-sm">Título da Competição</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Torneio de Palavras Semanal"
              className="h-8"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva as regras e objetivos da competição..."
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Data de Início */}
          <div className="space-y-1">
            <Label className="text-sm">Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-8",
                    !formData.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {formData.startDate ? (
                    format(formData.startDate, "PPP", { locale: ptBR })
                  ) : (
                    <span className="text-sm">Selecione a data de início</span>
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

          {/* Data de Fim (apenas para competições semanais) */}
          {formData.type === 'weekly' && (
            <div className="space-y-1">
              <Label className="text-sm">Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-8",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {formData.endDate ? (
                      format(formData.endDate, "PPP", { locale: ptBR })
                    ) : (
                      <span className="text-sm">Selecione a data de fim</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                    disabled={(date) => {
                      const today = new Date();
                      const startDate = formData.startDate;
                      return date < today || (startDate && date <= startDate);
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Prêmio (apenas para semanal e challenge) - Valor calculado automaticamente */}
          {competitionInfo.prizeEnabled && (
            <div className="space-y-1">
              <Label htmlFor="prizePool" className="flex items-center gap-2 text-sm">
                <DollarSign className="h-3 w-3" />
                Valor Total dos Prêmios (R$)
              </Label>
              <div className="bg-slate-50 p-2 rounded border">
                <div className="text-lg font-bold text-green-600">
                  R$ {totalPrizePool.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-600">
                  Valor calculado automaticamente baseado nas configurações de prêmios ativas do sistema.
                </p>
              </div>
            </div>
          )}

          {/* Máximo de Participantes */}
          <div className="space-y-1">
            <Label htmlFor="maxParticipants" className="flex items-center gap-2 text-sm">
              <Users className="h-3 w-3" />
              Máximo de Participantes
            </Label>
            <Input
              id="maxParticipants"
              type="number"
              min="1"
              value={formData.maxParticipants}
              onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 1000 }))}
              placeholder="1000"
              className="h-8"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-2">
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
