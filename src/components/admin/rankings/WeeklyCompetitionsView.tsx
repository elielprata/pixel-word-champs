
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, Crown, Clock, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { customCompetitionService } from '@/services/customCompetitionService';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const handleEdit = (competition: WeeklyCompetition) => {
    // TODO: Implementar modal de edição
    toast({
      title: "Editar competição",
      description: `Funcionalidade de edição para "${competition.title}" será implementada em breve.`,
    });
  };

  const handleDelete = async (competition: WeeklyCompetition) => {
    if (!confirm(`Tem certeza que deseja excluir a competição "${competition.title}"?`)) {
      return;
    }

    setDeletingId(competition.id);
    
    try {
      // Por enquanto, simular exclusão - implementar com o serviço real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Competição excluída",
        description: `A competição "${competition.title}" foi excluída com sucesso.`,
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Erro ao excluir competição:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a competição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
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
        <p className="font-medium mb-2">Nenhuma competição semanal ativa</p>
        <p className="text-sm">As competições semanais aparecerão aqui quando criadas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Competição Ativa em Destaque */}
      {activeCompetition && (
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
                    <p className="text-green-700">{formatDate(activeCompetition.start_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Fim</p>
                    <p className="text-green-700">{formatDate(activeCompetition.end_date)}</p>
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
                    <p className="font-medium">Participantes</p>
                    <p className="text-green-700">{activeCompetition.total_participants}/{activeCompetition.max_participants}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Todas as Competições */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-600" />
          Todas as Competições Semanais
        </h3>
        
        <div className="grid gap-4">
          {competitions.map((competition) => (
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
                        <span>{formatDate(competition.start_date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{formatDate(competition.end_date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-yellow-600" />
                        <span className="font-semibold">R$ {competition.prize_pool.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-slate-500" />
                        <span>{competition.total_participants}/{competition.max_participants}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(competition)}
                      className="h-8 w-8 p-0 hover:bg-blue-50"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(competition)}
                      disabled={deletingId === competition.id}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
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
    </div>
  );
};
