
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface WeeklyConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigUpdated: () => void;
}

export const WeeklyConfigModal: React.FC<WeeklyConfigModalProps> = ({
  open,
  onOpenChange,
  onConfigUpdated
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Carregar configuração atual quando o modal abrir
  React.useEffect(() => {
    if (open) {
      loadCurrentConfig();
    }
  }, [open]);

  const loadCurrentConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configuração:', error);
        return;
      }

      if (data) {
        // Usar as datas diretamente do banco (já são strings no formato YYYY-MM-DD)
        setStartDate(data.start_date || '');
        setEndDate(data.end_date || '');
      } else {
        // Valores padrão: competição da próxima semana
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        const weekAfter = new Date(nextWeek);
        weekAfter.setDate(nextWeek.getDate() + 6);
        
        setStartDate(nextWeek.toISOString().split('T')[0]);
        setEndDate(weekAfter.toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configuração atual",
        variant: "destructive",
      });
    }
  };

  // Função para formatar data YYYY-MM-DD para DD/MM/YYYY
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSave = async () => {
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

      // Desativar configurações existentes
      await supabase
        .from('weekly_config')
        .update({ is_active: false })
        .eq('is_active', true);

      // Criar nova configuração com datas simples (sem conversão de fuso)
      const { error: insertError } = await supabase
        .from('weekly_config')
        .insert({
          start_date: startDate,
          end_date: endDate,
          is_active: true
        });

      if (insertError) throw insertError;

      toast({
        title: "Sucesso!",
        description: `Competição configurada de ${formatDateForDisplay(startDate)} a ${formatDateForDisplay(endDate)}`,
      });

      onConfigUpdated();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: `Erro ao salvar configuração: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Período da Competição</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Data de Início</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-date">Data de Fim</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />
          </div>

          {startDate && endDate && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Período da Competição:</strong><br />
                {formatDateForDisplay(startDate)} até {formatDateForDisplay(endDate)}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
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
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
