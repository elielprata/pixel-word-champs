import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy, Edit, Trash2, Clock, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';
import { EditCompetitionModal } from './EditCompetitionModal';
import { DailyCompetitionRankingModal } from './DailyCompetitionRankingModal';

interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
  theme: string;
  rules: any;
}

interface DailyCompetitionsViewProps {
  competitions: DailyCompetition[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export const DailyCompetitionsView: React.FC<DailyCompetitionsViewProps> = ({
  competitions,
  isLoading,
  onRefresh
}) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCompetition, setEditingCompetition] = useState<DailyCompetition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingRankingId, setViewingRankingId] = useState<string | null>(null);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);

  // Filtrar apenas competições diárias (tipo 'challenge')
  const dailyCompetitions = competitions.filter(comp => comp.status !== 'cancelled');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Finalizado';
      default: return 'Rascunho';
    }
  };

  const handleEdit = (competition: DailyCompetition) => {
    console.log('🔧 Editando competição diária:', competition.id);
    setEditingCompetition(competition);
    setIsEditModalOpen(true);
  };

  const handleViewRanking = (competitionId: string) => {
    console.log('👀 Visualizando ranking da competição:', competitionId);
    setViewingRankingId(competitionId);
    setIsRankingModalOpen(true);
  };

  const handleDelete = async (competition: DailyCompetition) => {
    console.log('🗑️ Tentando excluir competição diária:', competition.id);
    
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
    console.log('🔄 Competição diária atualizada, recarregando lista...');
    if (onRefresh) {
      onRefresh();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando competições diárias...</p>
        </div>
      </div>
    );
  }

  if (dailyCompetitions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p className="font-medium mb-2">Nenhuma competição diária cadastrada</p>
        <p className="text-sm">Use o botão "Criar Competição" para adicionar uma nova competição diária.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aviso sobre horário de Brasília */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Horário de Referência: Brasília (UTC-3)</p>
          <p>Competições diárias: 00:00:00 até 23:59:59 do dia selecionado</p>
          <p className="text-xs mt-1 text-blue-600">
            ⚠️ Competições diárias não possuem premiação (apenas semanais têm prêmios)
          </p>
        </div>
      </div>

      {/* Lista de Competições Diárias */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Competições Diárias ({dailyCompetitions.length})
        </h3>
        
        <div className="grid gap-4">
          {dailyCompetitions.map((competition) => (
            <Card key={competition.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-800">{competition.title}</h4>
                      <Badge className={getStatusColor(competition.status)}>
                        {getStatusText(competition.status)}
                      </Badge>
                      {competition.theme && (
                        <Badge variant="outline" className="text-xs">
                          {competition.theme}
                        </Badge>
                      )}
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
                        <Trophy className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-500">Sem premiação</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-slate-500" />
                        <span>Máx: {competition.max_participants}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRanking(competition.id)}
                      className="h-8 w-8 p-0 hover:bg-green-50"
                      title="Ver ranking"
                    >
                      <Eye className="h-3 w-3" />
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
          ))}
        </div>
      </div>

      {/* Modal de Edição */}
      <EditCompetitionModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        competition={editingCompetition}
        onCompetitionUpdated={handleCompetitionUpdated}
      />

      {/* Modal de Ranking */}
      <DailyCompetitionRankingModal
        open={isRankingModalOpen}
        onOpenChange={setIsRankingModalOpen}
        competitionId={viewingRankingId}
      />
    </div>
  );
};
