
import React from 'react';
import { Trophy, ChevronLeft, ChevronRight, Calendar, Users, DollarSign, Award } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateForDisplay } from '@/utils/dateFormatters';
import { UnifiedCompetitionHistoryItem } from '@/types/weeklyConfig';

interface UnifiedCompetitionHistoryProps {
  historyData: UnifiedCompetitionHistoryItem[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const UnifiedCompetitionHistory: React.FC<UnifiedCompetitionHistoryProps> = ({
  historyData,
  isLoading,
  totalPages,
  currentPage,
  onPageChange
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Nenhuma competição finalizada ainda</p>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    return type === 'weekly' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getTypeIcon = (type: string) => {
    return type === 'weekly' ? <Calendar className="h-3 w-3" /> : <Trophy className="h-3 w-3" />;
  };

  return (
    <div>
      <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-blue-600" />
        Histórico Unificado de Competições
      </h3>
      
      <div className="space-y-4">
        {historyData.map((item) => (
          <div key={`${item.type}-${item.id}`} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge className={`flex items-center gap-1 ${getTypeColor(item.type)}`}>
                  {getTypeIcon(item.type)}
                  <span className="text-xs font-medium">
                    {item.type === 'weekly' ? 'Semanal' : 'Diária'}
                  </span>
                </Badge>
                {item.snapshot_exists && (
                  <Badge variant="outline" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    Snapshot
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">
                ID: {item.id.slice(0, 8)}...
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">
                {item.title}
              </h4>
              
              <p className="text-sm text-gray-600">
                <strong>Período:</strong> {formatDateForDisplay(item.start_date)} - {formatDateForDisplay(item.end_date)}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Participantes:</span>
                  <span className="font-medium">{item.total_participants}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Premiação:</span>
                  <span className="font-medium">R$ {item.total_prize_pool.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Ganhadores:</span>
                  <span className="font-medium">{item.winners_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Finalizada:</span>
                  <span className="font-medium">
                    {new Date(item.finalized_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-400">
                Status: <span className="capitalize">{item.status}</span>
              </p>
            </div>
          </div>
        ))}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
