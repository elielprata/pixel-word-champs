
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { UnifiedCompetition } from '@/types/competition';
import { formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';
import { useCompetitionStatusUpdater } from '@/hooks/useCompetitionStatusUpdater';

interface UnifiedCompetitionsListProps {
  competitions: UnifiedCompetition[];
  isLoading: boolean;
  onEdit: (competition: UnifiedCompetition) => void;
  onDelete: (competition: UnifiedCompetition) => void;
}

export const UnifiedCompetitionsList: React.FC<UnifiedCompetitionsListProps> = ({
  competitions,
  isLoading,
  onEdit,
  onDelete
}) => {
  // Atualizar status automaticamente
  useCompetitionStatusUpdater(competitions);

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

  const formatDateTime = (dateString: string, isEndDate: boolean = false) => {
    const date = new Date(dateString);
    const timeFormatted = isEndDate ? '23:59:59' : '00:00:00';
    return `${formatBrasiliaDate(date, false)}, ${timeFormatted}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Carregando competições...</p>
        </CardContent>
      </Card>
    );
  }

  if (competitions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma competição encontrada</h3>
          <p className="text-slate-600">Crie sua primeira competição diária para começar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
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
                  {competition.theme && (
                    <Badge variant="outline" className="text-xs">
                      {competition.theme}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-slate-600 mb-3">{competition.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span>Início: {formatDateTime(competition.startDate, false)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span>Fim: {formatDateTime(competition.endDate, true)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-green-600" />
                    <span className="text-green-600 font-medium">Participação Livre</span>
                  </div>
                </div>

                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <span className="text-blue-700">📝 Competição diária - Sem premiação em dinheiro</span>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(competition)}
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                  title="Editar competição"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(competition)}
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  title="Excluir competição"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
