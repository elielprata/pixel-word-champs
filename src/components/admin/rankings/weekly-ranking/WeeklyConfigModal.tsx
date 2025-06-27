
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { formatDateForDisplay } from '@/utils/dateFormatters';
import { Calendar, Plus, Clock } from 'lucide-react';

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

interface FinalizeResult {
  success: boolean;
  error?: string;
  winners_count?: number;
}

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
  const [activeConfig, setActiveConfig] = useState<WeeklyConfig | null>(null);
  const [scheduledConfigs, setScheduledConfigs] = useState<WeeklyConfig[]>([]);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  // Carregar configurações quando o modal abrir
  React.useEffect(() => {
    if (open) {
      loadConfigurations();
    }
  }, [open]);

  const loadConfigurations = async () => {
    try {
      // Carregar competição ativa
      const { data: activeData, error: activeError } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('status', 'active')
        .single();

      if (activeError && activeError.code !== 'PGRST116') {
        console.error('Erro ao carregar configuração ativa:', activeError);
      } else {
        setActiveConfig(activeData as WeeklyConfig);
      }

      // Carregar competições agendadas
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('status', 'scheduled')
        .order('start_date', { ascending: true });

      if (scheduledError) {
        console.error('Erro ao carregar configurações agendadas:', scheduledError);
      } else {
        setScheduledConfigs((scheduledData || []) as WeeklyConfig[]);
      }

      // Valores padrão para nova competição
      if (scheduledData && scheduledData.length > 0) {
        const lastScheduled = scheduledData[scheduledData.length - 1];
        const nextStart = new Date(lastScheduled.end_date);
        nextStart.setDate(nextStart.getDate() + 1);
        const nextEnd = new Date(nextStart);
        nextEnd.setDate(nextEnd.getDate() + 6);
        
        setNewStartDate(nextStart.toISOString().split('T')[0]);
        setNewEndDate(nextEnd.toISOString().split('T')[0]);
      } else if (activeData) {
        const nextStart = new Date(activeData.end_date);
        nextStart.setDate(nextStart.getDate() + 1);
        const nextEnd = new Date(nextStart);
        nextEnd.setDate(nextEnd.getDate() + 6);
        
        setNewStartDate(nextStart.toISOString().split('T')[0]);
        setNewEndDate(nextEnd.toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      });
    }
  };

  const handleScheduleNew = async () => {
    if (!newStartDate || !newEndDate) {
      toast({
        title: "Erro",
        description: "Por favor, preencha ambas as datas",
        variant: "destructive",
      });
      return;
    }

    if (new Date(newStartDate) >= new Date(newEndDate)) {
      toast({
        title: "Erro",
        description: "A data de início deve ser anterior à data de fim",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Criar nova competição agendada
      const { error: insertError } = await supabase
        .from('weekly_config')
        .insert({
          start_date: newStartDate,
          end_date: newEndDate,
          status: 'scheduled'
        });

      if (insertError) throw insertError;

      toast({
        title: "Sucesso!",
        description: `Nova competição agendada de ${formatDateForDisplay(newStartDate)} a ${formatDateForDisplay(newEndDate)}`,
      });

      onConfigUpdated();
      loadConfigurations();
      
      // Limpar campos
      setNewStartDate('');
      setNewEndDate('');

    } catch (error: any) {
      console.error('Erro ao agendar nova competição:', error);
      toast({
        title: "Erro",
        description: `Erro ao agendar competição: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!activeConfig) {
      toast({
        title: "Erro",
        description: "Nenhuma competição ativa para finalizar",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.rpc('finalize_weekly_competition');

      if (error) throw error;

      const result = data as FinalizeResult;

      if (result.success) {
        toast({
          title: "Competição Finalizada!",
          description: `Competição finalizada com ${result.winners_count || 0} ganhadores. Dados salvos no histórico.`,
        });

        onConfigUpdated();
        onOpenChange(false);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }

    } catch (error: any) {
      console.error('Erro ao finalizar competição:', error);
      toast({
        title: "Erro",
        description: `Erro ao finalizar competição: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Competições Semanais</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="schedule">Agendar Nova</TabsTrigger>
            <TabsTrigger value="finalize">Finalizar Atual</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-4">
              {/* Competição Ativa */}
              {activeConfig && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Competição Ativa</span>
                  </div>
                  <p className="text-green-700">
                    {formatDateForDisplay(activeConfig.start_date)} até {formatDateForDisplay(activeConfig.end_date)}
                  </p>
                </div>
              )}

              {/* Competições Agendadas */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700">Competições Agendadas ({scheduledConfigs.length})</h3>
                {scheduledConfigs.length === 0 ? (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                    <p className="text-orange-700">Nenhuma competição agendada</p>
                    <p className="text-orange-600 text-sm">Configure pelo menos uma para evitar interrupções</p>
                  </div>
                ) : (
                  scheduledConfigs.map((config, index) => (
                    <div key={config.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Competição {index + 1}</span>
                      </div>
                      <p className="text-blue-700">
                        {formatDateForDisplay(config.start_date)} até {formatDateForDisplay(config.end_date)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-start-date">Data de Início</Label>
                <Input
                  id="new-start-date"
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-end-date">Data de Fim</Label>
                <Input
                  id="new-end-date"
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {newStartDate && newEndDate && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Nova Competição:</strong><br />
                    {formatDateForDisplay(newStartDate)} até {formatDateForDisplay(newEndDate)}
                  </p>
                </div>
              )}

              <Button 
                onClick={handleScheduleNew}
                disabled={isLoading || !newStartDate || !newEndDate}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? 'Agendando...' : 'Agendar Competição'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="finalize" className="space-y-4">
            {activeConfig ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="font-medium text-amber-800 mb-2">Finalizar Competição Atual</h3>
                  <p className="text-amber-700 text-sm mb-3">
                    Período: {formatDateForDisplay(activeConfig.start_date)} até {formatDateForDisplay(activeConfig.end_date)}
                  </p>
                  <div className="text-amber-700 text-sm space-y-1">
                    <p>✓ Criará backup dos ganhadores</p>
                    <p>✓ Resetará pontuações dos usuários</p>
                    <p>✓ Ativará próxima competição (se agendada)</p>
                  </div>
                </div>

                <Button 
                  onClick={handleFinalize}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? 'Finalizando...' : 'Finalizar Competição e Resetar'}
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-gray-600">Nenhuma competição ativa para finalizar</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
