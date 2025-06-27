
import React from 'react';
import { Button } from "@/components/ui/button";
import { formatDateForDisplay } from '@/utils/dateFormatters';
import { Calendar, Clock, Edit, Trash2, CheckCircle } from 'lucide-react';
import { WeeklyConfig } from '@/types/weeklyConfig';

interface CompetitionCardProps {
  competition: WeeklyConfig;
  onEdit: (competition: WeeklyConfig) => void;
  onDelete: (competition: WeeklyConfig) => void;
}

export const CompetitionCard: React.FC<CompetitionCardProps> = ({
  competition,
  onEdit,
  onDelete
}) => {
  const getStatusConfig = () => {
    switch (competition.status) {
      case 'active':
        return {
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Ativa'
        };
      case 'scheduled':
        return {
          color: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          icon: <Clock className="h-4 w-4" />,
          label: 'Agendada'
        };
      case 'completed':
        return {
          color: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          icon: <Calendar className="h-4 w-4" />,
          label: 'Finalizada'
        };
      default:
        return {
          color: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          icon: <Calendar className="h-4 w-4" />,
          label: 'Desconhecido'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const canEdit = competition.status === 'active' || competition.status === 'scheduled';
  const canDelete = competition.status === 'scheduled';

  return (
    <div className={`p-4 border rounded-lg ${statusConfig.color}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 ${statusConfig.textColor}`}>
          {statusConfig.icon}
          <span className="font-medium text-sm">{statusConfig.label}</span>
        </div>
        
        {(canEdit || canDelete) && (
          <div className="flex items-center gap-1">
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(competition)}
                className="h-7 px-2"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(competition)}
                className="h-7 px-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className={`${statusConfig.textColor} space-y-1`}>
        <p className="font-medium">
          {formatDateForDisplay(competition.start_date)} - {formatDateForDisplay(competition.end_date)}
        </p>
        <p className="text-xs opacity-75">
          Criada em: {new Date(competition.created_at).toLocaleDateString('pt-BR')}
        </p>
        {competition.status === 'active' && competition.activated_at && (
          <p className="text-xs opacity-75">
            Ativada em: {new Date(competition.activated_at).toLocaleDateString('pt-BR')}
          </p>
        )}
        {competition.status === 'completed' && competition.completed_at && (
          <p className="text-xs opacity-75">
            Finalizada em: {new Date(competition.completed_at).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>

      {competition.status === 'active' && canEdit && (
        <div className="mt-2 text-xs text-amber-600">
          💡 Apenas a data de fim pode ser alterada em competições ativas
        </div>
      )}
    </div>
  );
};
