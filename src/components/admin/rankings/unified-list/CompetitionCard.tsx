
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Edit, Trash2, Clock } from 'lucide-react';
import { UnifiedCompetition } from '@/types/competition';
import { formatBrasiliaDate, formatTimePreview } from '@/utils/brasiliaTimeUnified';

interface CompetitionCardProps {
  competition: UnifiedCompetition;
  onEdit: (competition: UnifiedCompetition) => void;
  onDelete: (competition: UnifiedCompetition) => void;
  isDeleting: boolean;
}

export const CompetitionCard: React.FC<CompetitionCardProps> = ({
  competition,
  onEdit,
  onDelete,
  isDeleting
}) => {
  // Debug logs para verificar dados recebidos
  console.log('🃏 CompetitionCard: Dados recebidos:', {
    id: competition.id,
    title: competition.title,
    startDate: competition.startDate,
    endDate: competition.endDate,
    duration: competition.duration,
    rawStartDate: new Date(competition.startDate).toISOString(),
    rawEndDate: new Date(competition.endDate).toISOString()
  });

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

  const formatDateTimeCorrect = (dateString: string, label: string) => {
    if (!dateString) {
      console.warn(`⚠️ Data vazia para ${label}`);
      return 'Data inválida';
    }

    try {
      const date = new Date(dateString);
      const dateFormatted = formatBrasiliaDate(date, false);
      const timeFormatted = formatTimePreview(dateString);
      
      const result = `${dateFormatted}, ${timeFormatted}`;
      console.log(`📅 ${label}:`, {
        input: dateString,
        parsed: date.toISOString(),
        formatted: result
      });
      
      return result;
    } catch (error) {
      console.error(`❌ Erro ao formatar ${label}:`, error);
      return 'Data inválida';
    }
  };

  const calculateAndDisplayDuration = () => {
    // Priorizar duração fornecida
    if (competition.duration && competition.duration > 0) {
      console.log('⏱️ Usando duração fornecida:', competition.duration);
      return `${competition.duration}h`;
    }
    
    // Calcular duração baseada nas datas
    if (competition.startDate && competition.endDate) {
      try {
        const start = new Date(competition.startDate);
        const end = new Date(competition.endDate);
        const diffMs = end.getTime() - start.getTime();
        const hours = Math.round(diffMs / (1000 * 60 * 60));
        
        console.log('🧮 Duração calculada:', {
          start: start.toISOString(),
          end: end.toISOString(),
          diffMs,
          hours
        });
        
        return `${hours}h`;
      } catch (error) {
        console.error('❌ Erro ao calcular duração:', error);
        return 'N/A';
      }
    }
    
    console.warn('⚠️ Não foi possível determinar duração');
    return 'N/A';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
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
                <span>Início: {formatDateTimeCorrect(competition.startDate, 'Início')}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-500" />
                <span>Fim: {formatDateTimeCorrect(competition.endDate, 'Fim')}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-600" />
                <span className="text-blue-600 font-medium">
                  Duração: {calculateAndDisplayDuration()}
                </span>
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
              disabled={isDeleting}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              title="Excluir competição"
            >
              {isDeleting ? (
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
};
