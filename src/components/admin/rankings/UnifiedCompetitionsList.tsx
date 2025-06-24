
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy, Edit, Trash2 } from 'lucide-react';
import { UnifiedCompetition } from '@/types/competition';

interface UnifiedCompetitionsListProps {
  competitions: UnifiedCompetition[];
  isLoading: boolean;
  onEdit: (competition: UnifiedCompetition) => void;
  onDelete: (competition: UnifiedCompetition) => void;
}

export const UnifiedCompetitionsList = ({
  competitions,
  isLoading,
  onEdit,
  onDelete
}: UnifiedCompetitionsListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Carregando competições...</span>
      </div>
    );
  }

  if (competitions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Nenhuma competição encontrada
          </h3>
          <p className="text-slate-600">
            Comece criando sua primeira competição diária.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {competitions.map((competition) => (
        <Card key={competition.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{competition.title}</CardTitle>
                <p className="text-slate-600 text-sm mb-3">{competition.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-orange-100 text-orange-800">
                    Competição Diária
                  </Badge>
                  <Badge className={getStatusColor(competition.status)}>
                    {competition.status === 'active' ? 'Ativa' : 
                     competition.status === 'scheduled' ? 'Agendada' : 
                     competition.status === 'completed' ? 'Finalizada' : 'Rascunho'}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(competition)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(competition)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="font-medium">Início</div>
                  <div className="text-slate-600">{formatDate(competition.startDate)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="font-medium">Fim</div>
                  <div className="text-slate-600">{formatDate(competition.endDate)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="font-medium">Participantes</div>
                  <div className="text-slate-600">
                    {competition.totalParticipants || 0} / {competition.maxParticipants}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
