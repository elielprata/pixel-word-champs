
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Trophy, Edit, Trash2, Info } from 'lucide-react';
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

  const handleDelete = async (competition: WeeklyCompetition) => {
    if (window.confirm(`Tem certeza que deseja excluir a competição "${competition.title}"?`)) {
      setDeletingId(competition.id);
      
      try {
        const response = await customCompetitionService.deleteCompetition(competition.id);
        
        if (response.success) {
          toast({
            title: "Competição excluída",
            description: `A competição "${competition.title}" foi excluída com sucesso.`,
          });
          
          if (onRefresh) {
            onRefresh();
          }
        } else {
          throw new Error(response.error || 'Erro ao excluir competição');
        }
      } catch (error) {
        console.error('Erro ao excluir competição:', error);
        toast({
          title: "Erro ao excluir",
          description: error instanceof Error ? error.message : "Não foi possível excluir a competição.",
          variant: "destructive",
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
      <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg bg-slate-50">
        <Trophy className="h-10 w-10 text-slate-400 mx-auto mb-2" />
        <h4 className="text-lg font-medium text-slate-700">Nenhuma competição semanal</h4>
        <p className="text-sm text-slate-500 mb-4">
          Não há competições semanais criadas ou agendadas no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800 mb-1">Sobre as Competições Semanais</h3>
            <p className="text-sm text-blue-700">
              As competições semanais permitem que todos os usuários participem e acumulem pontos durante 
              toda a semana. Ao final, os melhores colocados recebem prêmios.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md">
              <Users className="h-3 w-3" />
              🎉 PARTICIPAÇÃO LIVRE: Todos podem participar sem limite!
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Competições */}
      <div className="grid gap-4">
        {competitions.map((competition) => (
          <Card key={competition.id} className="overflow-hidden border-slate-200 hover:border-slate-300 transition-colors">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {/* Conteúdo */}
                <div className="p-4 md:p-5 flex-grow border-b md:border-b-0 md:border-r border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{competition.title}</h3>
                    <Badge className={getStatusColor(competition.status)}>
                      {competition.status === 'active' ? 'Ativo' : 
                      competition.status === 'scheduled' ? 'Agendado' :
                      competition.status === 'completed' ? 'Finalizado' : 'Cancelado'}
                    </Badge>
                  </div>
                  
                  {competition.description && (
                    <p className="text-sm text-slate-600 mb-3">{competition.description}</p>
                  )}
                  
                  <div className="grid md:grid-cols-3 gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Período</p>
                        <p className="font-medium text-slate-700">
                          {formatDate(competition.start_date)} - {formatDate(competition.end_date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Premiação</p>
                        <p className="font-medium text-slate-700">
                          R$ {competition.prize_pool.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Participação</p>
                        <p className="font-medium text-green-600">LIVRE</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ações */}
                <div className="bg-slate-50 p-4 md:p-5 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 min-w-[200px]">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.location.href = `/admin/edit-competition/${competition.id}`}
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Editar
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    onClick={() => handleDelete(competition)}
                    disabled={deletingId === competition.id}
                  >
                    {deletingId === competition.id ? (
                      <>
                        <div className="h-3 w-3 border-t-2 border-red-600 rounded-full animate-spin mr-2" />
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3 mr-2" />
                        Excluir
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
