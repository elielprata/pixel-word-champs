
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, Crown, Clock, Edit, Trash2, MapPin, Hourglass } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';
import { EditCompetitionModal } from './EditCompetitionModal';
import { WeeklyRankingModal } from './WeeklyRankingModal';
import { useNavigate } from 'react-router-dom';
import { useCompetitionStatusUpdater } from '@/hooks/useCompetitionStatusUpdater';

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

interface WeeklyCompetitionsViewProps {
  competitions: WeeklyCompetition[];
  activeCompetition: WeeklyCompetition | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

export const WeeklyCompetitionsView: React.FC<WeeklyCompetitionsViewProps> = ({
  competitions,
  activeCompetition,
  isLoading,
  onRefresh
}) => {
  // Adicionar hook para atualização automática de status
  useCompetitionStatusUpdater(competitions);

  const { toast } = useToast();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCompetition, setEditingCompetition] = useState<WeeklyCompetition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('');

  // Separar competições por status
  const activeCompetitions = competitions.filter(comp => comp.status === 'active');
  const scheduledCompetitions = competitions.filter(comp => comp.status === 'scheduled');
  const completedCompetitions = competitions.filter(comp => comp.status === 'completed');

  // Filtrar outras competições ativas (excluindo a principal)
  const otherActiveCompetitions = activeCompetitions.filter(comp => 
    !activeCompetition || comp.id !== activeCompetition.id
  );

  const formatDateTime = (dateString: string, isEndDate: boolean = false) => {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const timeFormatted = isEndDate ? '23:59:59' : '00:00:00';
    
    return `${dateFormatted}, ${timeFormatted}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'scheduled': return 'Aguardando';
      case 'completed': return 'Finalizado';
      default: return 'Rascunho';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Crown;
      case 'scheduled': return Hourglass;
      case 'completed': return Trophy;
      default: return Calendar;
    }
  };

  const handleViewRanking = (competition: WeeklyCompetition) => {
    console.log('👁️ Abrindo modal de ranking da competição semanal:', competition.id);
    setSelectedCompetitionId(competition.id);
    setIsRankingModalOpen(true);
  };

  const handleEdit = (competition: WeeklyCompetition) => {
    console.log('🔧 Editando competição:', competition.id);
    setEditingCompetition(competition);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (competition: WeeklyCompetition) => {
    console.log('🗑️ Tentando excluir competição:', competition.id);
    
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir a competição "${competition.title}"?`);
    if (!confirmDelete) {
      console.log('❌ Exclusão cancelada pelo usuário');
      return;
    }

    setDeletingId(competition.id);
    
    try {
      console.log('📤 Chamando serviço de exclusão...');
      const response = await customCompetitionService.deleteCompetition(competition.id);
      
      if (response.success) {
        console.log('✅ Competição excluída com sucesso');
        toast({
          title: "Competição excluída",
          description: `A competição "${competition.title}" foi excluída com sucesso.`,
        });
        
        if (onRefresh) {
          console.log('🔄 Atualizando lista de competições...');
          onRefresh();
        }
      } else {
        console.error('❌ Erro no serviço:', response.error);
        throw new Error(response.error || 'Erro ao excluir competição');
      }
    } catch (error) {
      console.error('❌ Erro ao excluir competição:', error);
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Não foi possível excluir a competição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCompetitionUpdated = () => {
    console.log('🔄 Competição atualizada, recarregando lista...');
    if (onRefresh) {
      onRefresh();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando competições semanais...</p>
        </div>
      </div>
    );
  }

  if (competitions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p className="font-medium mb-2">Nenhuma competição semanal criada</p>
        <p className="text-sm">As competições semanais aparecerão aqui quando criadas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Sistema de Status Automático</p>
          <p>🟢 <strong>Ativo:</strong> Competição em andamento | 🔵 <strong>Aguardando:</strong> Início futuro | 🟣 <strong>Finalizado:</strong> Período encerrado</p>
          <p className="text-xs mt-1">Status atualizados automaticamente a cada 5 minutos | Horário: Brasília (UTC-3)</p>
        </div>
      </div>

      {/* Competição Ativa Principal */}
      {activeCompetition && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg text-white">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-green-800">🏆 Competição Ativa</span>
                  <p className="text-sm font-normal text-green-600 mt-1">Competição principal em andamento</p>
                </div>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white border-green-500 px-3 py-1 text-sm font-semibold">
                  {getStatusText(activeCompetition.status)}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewRanking(activeCompetition)}
                    className="h-8 w-8 p-0 hover:bg-green-50 border-green-300"
                    title="Ver ranking"
                  >
                    <Trophy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(activeCompetition)}
                    className="h-8 w-8 p-0 hover:bg-blue-50 border-green-300"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(activeCompetition)}
                    disabled={deletingId === activeCompetition.id}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 border-green-300"
                  >
                    {deletingId === activeCompetition.id ? (
                      <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-xl text-green-800">{activeCompetition.title}</h3>
                <p className="text-green-700 text-base mt-1">{activeCompetition.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3 text-base">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Início</p>
                    <p className="text-green-700">{formatDateTime(activeCompetition.start_date, false)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-base">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Fim</p>
                    <p className="text-green-700">{formatDateTime(activeCompetition.end_date, true)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-base">
                  <Trophy className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Prêmio</p>
                    <p className="text-green-700 font-bold text-lg">R$ {activeCompetition.prize_pool.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-base">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Participação</p>
                    <p className="text-green-700 font-semibold">Livre</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competições Aguardando */}
      {scheduledCompetitions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Hourglass className="h-5 w-5 text-blue-600" />
            Competições Aguardando ({scheduledCompetitions.length})
          </h3>
          
          <div className="grid gap-4">
            {scheduledCompetitions.map((competition) => {
              const StatusIcon = getStatusIcon(competition.status);
              return (
                <Card key={competition.id} className="hover:shadow-md transition-shadow border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusIcon className="h-4 w-4 text-blue-600" />
                          <h4 className="font-semibold text-slate-800">{competition.title}</h4>
                          <Badge className={getStatusColor(competition.status)}>
                            {getStatusText(competition.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-3">{competition.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            <span>Início: {formatDateTime(competition.start_date, false)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span>Fim: {formatDateTime(competition.end_date, true)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3 text-yellow-600" />
                            <span className="font-semibold">R$ {competition.prize_pool.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-blue-600" />
                            <span className="text-blue-600 font-medium">Participação Livre</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(competition)}
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                          title="Editar competição"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(competition)}
                          disabled={deletingId === competition.id}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          title="Excluir competição"
                        >
                          {deletingId === competition.id ? (
                            <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Outras Competições Ativas */}
      {otherActiveCompetitions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-green-600" />
            Outras Competições Ativas ({otherActiveCompetitions.length})
          </h3>
          
          <div className="grid gap-4">
            {otherActiveCompetitions.map((competition) => {
              const StatusIcon = getStatusIcon(competition.status);
              return (
                <Card key={competition.id} className="hover:shadow-md transition-shadow border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusIcon className="h-4 w-4 text-green-600" />
                          <h4 className="font-semibold text-slate-800">{competition.title}</h4>
                          <Badge className={getStatusColor(competition.status)}>
                            {getStatusText(competition.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-3">{competition.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            <span>Início: {formatDateTime(competition.start_date, false)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span>Fim: {formatDateTime(competition.end_date, true)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3 text-yellow-600" />
                            <span className="font-semibold">R$ {competition.prize_pool.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-green-600" />
                            <span className="text-green-600 font-medium">Participação Livre</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRanking(competition)}
                          className="h-8 w-8 p-0 hover:bg-green-50"
                          title="Ver ranking"
                        >
                          <Trophy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(competition)}
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                          title="Editar competição"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(competition)}
                          disabled={deletingId === competition.id}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          title="Excluir competição"
                        >
                          {deletingId === competition.id ? (
                            <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <EditCompetitionModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        competition={editingCompetition}
        onCompetitionUpdated={handleCompetitionUpdated}
      />

      <WeeklyRankingModal
        open={isRankingModalOpen}
        onOpenChange={setIsRankingModalOpen}
        competitionId={selectedCompetitionId}
      />
    </div>
  );
};
