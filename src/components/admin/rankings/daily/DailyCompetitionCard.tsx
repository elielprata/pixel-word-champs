
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trophy, Users, Edit, Trash2 } from 'lucide-react';
import { formatDateTimeRange } from '@/utils/formatters';

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
}

interface DailyCompetitionCardProps {
  competition: DailyCompetition;
  onEdit: (competition: DailyCompetition) => void;
  onDelete: (competition: DailyCompetition) => void;
  isDeleting?: boolean;
}

export const DailyCompetitionCard: React.FC<DailyCompetitionCardProps> = ({
  competition,
  onEdit,
  onDelete,
  isDeleting = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getFormattedDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className="overflow-hidden border-slate-200 hover:border-slate-300 transition-colors">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Título e Status */}
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
            
            {/* Tema */}
            {competition.theme && (
              <Badge variant="outline" className="mb-3 bg-yellow-50 text-yellow-700 border-yellow-200">
                {competition.theme}
              </Badge>
            )}
            
            <div className="space-y-2">
              {/* Período */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="h-3 w-3" />
                <span>{formatDateTimeRange(competition.start_date, competition.end_date)}</span>
              </div>
              
              {/* Participantes */}
              <div className="flex items-center gap-2 text-xs text-green-600">
                <Users className="h-3 w-3" />
                <span>PARTICIPAÇÃO LIVRE (sem limite de participantes)</span>
              </div>
            </div>
          </div>
          
          {/* Ações */}
          <div className="bg-slate-50 p-4 md:p-5 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 min-w-[200px]">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => onEdit(competition)}
            >
              <Edit className="h-3 w-3 mr-2" />
              Editar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              onClick={() => onDelete(competition)}
              disabled={isDeleting}
            >
              {isDeleting ? (
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
  );
};
