
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { formatDateForDisplay } from '@/utils/dateFormatters';
import { Calendar, AlertTriangle } from 'lucide-react';

interface WeeklyConfig {
  id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'scheduled' | 'completed';
  activated_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface EditCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competition: WeeklyConfig | null;
  onSuccess: () => void;
}

export const EditCompetitionModal: React.FC<EditCompetitionModalProps> = ({
  open,
  onOpenChange,
  competition,
  onSuccess
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  React.useEffect(() => {
    if (competition && open) {
      setStartDate(competition.start_date);
      setEndDate(competition.end_date);
    }
  }, [competition, open]);

  const handleSave = async () => {
    if (!competition) return;

    if (!startDate || !endDate) {
      toast({
        title: "Erro",
        description: "Por favor, preencha ambas as datas",
        variant: "destructive",
      });
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast({
        title: "Erro",
        description: "A data de início deve ser anterior à data de fim",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      let result;
      if (competition.status === 'active') {
        // Para competições ativas, só permite alterar a data de fim
        const { data, error } = await supabase.rpc('update_active_competition_end_date', {
          competition_id: competition.id,
          new_end_date: endDate
        });

        if (error) throw error;
        result = data;
      } else {
        // Para competições agendadas, permite alterar ambas as datas
        const { data, error } = await supabase.rpc('update_scheduled_competition', {
          competition_id: competition.id,
          new_start_date: startDate,
          new_end_date: endDate
        });

        if (error) throw error;
        result = data;
      }

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(result.error);
      }

    } catch (error: any) {
      console.error('Erro ao atualizar competição:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar competição: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!competition) return null;

  const isActive = competition.status === 'active';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Editar Competição {isActive ? 'Ativa' : 'Agendada'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isActive && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium text-sm">Competição Ativa</span>
              </div>
              <p className="text-amber-700 text-xs">
                Para competições ativas, apenas a data de fim pode ser alterada.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="start-date">Data de Início</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isActive || isLoading}
              className={isActive ? "bg-gray-100" : ""}
            />
            {isActive && (
              <p className="text-xs text-gray-500">
                Data atual: {formatDateForDisplay(startDate)}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-date">Data de Fim</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Período:</strong><br />
              {formatDateForDisplay(startDate)} até {formatDateForDisplay(endDate)}
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
