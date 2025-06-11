
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, Crown, Clock, Edit, Trash2, MapPin } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';
import { EditCompetitionModal } from './EditCompetitionModal';
import { useNavigate } from 'react-router-dom';

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCompetition, setEditingCompetition] = useState<WeeklyCompetition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const activeCompetitions = competitions.filter(comp => 
    comp.status !== 'completed' && comp.status !== 'cancelled'
  );

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
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Finalizado';
      default: return 'Rascunho';
    }
  };

  const handleViewRanking = (competition: WeeklyCompetition) => {
    console.log('👁️ Navegando para ranking da competição semanal:', competition.id);
    navigate(`/admin/weekly-competition/${competition.id}/ranking`);
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

  if (activeCompetitions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p className="font-medium mb-2">Nenhuma competição semanal ativa</p>
        <p className="text-sm">As competições semanais ativas aparecerão aqui quando criadas.</p>
        <p className="text-xs text-slate-400 mt-2">
          Competições finalizadas podem ser vistas na aba "Histórico"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Horário de Referência: Brasília (UTC-3)</p>
          <p>Início automático: 00:00:00 | Fim automático: 23:59:59 | Status atualizados automaticamente</p>
          <p className="text-xs mt-1 text-purple-600">
            📋 Competições finalizadas são exibidas apenas na aba "Histórico"
          </p>
        </div>
      </div>

      {activeCompetition && activeCompetition.status !== 'completed' && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-green-600" />
                Competição Ativa
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(activeCompetition.status)}>
                  {getStatusText(activeCompetition.status)}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewRanking(activeCompetition)}
                    className="h-8 w-8 p-0 hover:bg-green-50"
                    title="Ver ranking"
                  >
                    <Trophy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(activeCompetition)}
                    className="h-8 w-8 p-0 hover:bg-blue-50"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(activeCompetition)}
                    disabled={deletingId === activeCompetition.id}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
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
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-green-800">{activeCompetition.title}</h3>
                <p className="text-green-700 text-sm">{activeCompetition.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Início</p>
                    <p className="text-green-700">{formatDateTime(activeCompetition.start_date, false)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Fim</p>
                    <p className="text-green-700">{formatDateTime(activeCompetition.end_date, true)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Prêmio</p>
                    <p className="text-green-700 font-semibold">R$ {activeCompetition.prize_pool.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Participação</p>
                    <p className="text-green-700 font-semibold">Livre</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {otherActiveCompetitions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            Outras Competições Semanais Ativas
          </h3>
          
          <div className="grid gap-4">
            {otherActiveCompetitions.map((competition) => (
              <Card key={competition.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-slate-800">{competition.title}</h4>
                        <Badge className={getStatusColor(competition.status)}>
                          {getStatusText(competition.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3">{competition.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span>{formatDateTime(competition.start_date, false)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span>{formatDateTime(competition.end_date, true)}</span>
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
            ))}
          </div>
        </div>
      )}

      <EditCompetitionModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        competition={editingCompetition}
        onCompetitionUpdated={handleCompetitionUpdated}
      />
    </div>
  );
};
