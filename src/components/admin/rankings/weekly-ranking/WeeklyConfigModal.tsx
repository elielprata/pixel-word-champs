import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useWeeklyConfig } from '@/hooks/useWeeklyConfig';
import { EditCompetitionModal } from './EditCompetitionModal';
import { DeleteCompetitionModal } from './DeleteCompetitionModal';
import { CompetitionCard } from './CompetitionCard';
import { formatDateForDisplay } from '@/utils/dateFormatters';
import { Calendar, Plus, Trophy, AlertCircle } from 'lucide-react';

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
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<WeeklyConfig | null>(null);

  const {
    activeConfig,
    scheduledConfigs,
    completedConfigs,
    isLoading: configsLoading,
    loadConfigurations,
    scheduleCompetition,
    finalizeCompetition
  } = useWeeklyConfig();

  // Valores padrão para nova competição
  React.useEffect(() => {
    if (open && !newStartDate && !newEndDate) {
      const nextStart = new Date();
      if (scheduledConfigs.length > 0) {
        const lastScheduled = scheduledConfigs[scheduledConfigs.length - 1];
        nextStart.setTime(new Date(lastScheduled.end_date).getTime() + 24 * 60 * 60 * 1000);
      } else if (activeConfig) {
        nextStart.setTime(new Date(activeConfig.end_date).getTime() + 24 * 60 * 60 * 1000);
      }
      
      const nextEnd = new Date(nextStart);
      nextEnd.setDate(nextEnd.getDate() + 6);
      
      setNewStartDate(nextStart.toISOString().split('T')[0]);
      setNewEndDate(nextEnd.toISOString().split('T')[0]);
    }
  }, [open, scheduledConfigs, activeConfig, newStartDate, newEndDate]);

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

      const result = await scheduleCompetition(newStartDate, newEndDate);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: `Nova competição agendada de ${formatDateForDisplay(newStartDate)} a ${formatDateForDisplay(newEndDate)}`,
        });

        onConfigUpdated();
        
        // Limpar campos e calcular próximas datas
        const nextStart = new Date(newEndDate);
        nextStart.setDate(nextStart.getDate() + 1);
        const nextEnd = new Date(nextStart);
        nextEnd.setDate(nextEnd.getDate() + 6);
        
        setNewStartDate(nextStart.toISOString().split('T')[0]);
        setNewEndDate(nextEnd.toISOString().split('T')[0]);
      } else {
        throw new Error(result.error);
      }

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

      const result = await finalizeCompetition();

      if (result.success) {
        toast({
          title: "Competição Finalizada!",
          description: `Competição finalizada com ${result.data.winners_count || 0} ganhadores. Dados salvos no histórico.`,
        });

        onConfigUpdated();
        onOpenChange(false);
      } else {
        throw new Error(result.error);
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

  const handleEdit = (competition: WeeklyConfig) => {
    setSelectedCompetition(competition);
    setEditModalOpen(true);
  };

  const handleDelete = (competition: WeeklyConfig) => {
    setSelectedCompetition(competition);
    setDeleteModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadConfigurations();
    onConfigUpdated();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Competições Semanais</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="schedule">Agendar Nova</TabsTrigger>
              <TabsTrigger value="finalize">Finalizar Atual</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {configsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Competição Ativa */}
                  {activeConfig && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Competição Ativa</h3>
                      <CompetitionCard
                        competition={activeConfig}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </div>
                  )}

                  {/* Competições Agendadas */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Competições Agendadas ({scheduledConfigs.length})
                    </h3>
                    {scheduledConfigs.length === 0 ? (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                        <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-orange-700">Nenhuma competição agendada</p>
                        <p className="text-orange-600 text-sm">Configure pelo menos uma para evitar interrupções</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {scheduledConfigs.map((config) => (
                          <CompetitionCard
                            key={config.id}
                            competition={config}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
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

            <TabsContent value="history" className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Competições Finalizadas
                </h3>
                {completedConfigs.length === 0 ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Nenhuma competição finalizada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {completedConfigs.map((config) => (
                      <CompetitionCard
                        key={config.id}
                        competition={config}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
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

      <EditCompetitionModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        competition={selectedCompetition}
        onSuccess={handleModalSuccess}
      />

      <DeleteCompetitionModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        competition={selectedCompetition}
        onSuccess={handleModalSuccess}
      />
    </>
  );
};
