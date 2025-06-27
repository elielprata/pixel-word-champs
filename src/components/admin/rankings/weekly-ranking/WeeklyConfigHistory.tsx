
import React from 'react';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatDateForDisplay } from '@/utils/dateFormatters';
import { WeeklyConfig } from '@/types/weeklyConfig';

interface CompetitionHistoryItem extends Omit<WeeklyConfig, 'status'> {
  status: string;
  stats?: {
    totalParticipants: number;
    totalPrizePool: number;
    winnersCount: number;
  };
}

interface WeeklyConfigHistoryProps {
  historyData: CompetitionHistoryItem[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const WeeklyConfigHistory: React.FC<WeeklyConfigHistoryProps> = ({
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

  return (
    <div>
      <h3 className="font-medium text-gray-700 mb-4">
        Competições Finalizadas
      </h3>
      
      <div className="space-y-4">
        {historyData.map((config) => (
          <div key={config.id} className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-800">
                <Trophy className="h-4 w-4" />
                <span className="font-medium text-sm">Finalizada</span>
              </div>
              <div className="text-xs text-gray-500">
                ID: {config.id.slice(0, 8)}...
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-gray-800">
                {formatDateForDisplay(config.start_date)} - {formatDateForDisplay(config.end_date)}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Participantes:</span>
                  <span className="ml-1 font-medium">{config.stats?.totalParticipants || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Premiação:</span>
                  <span className="ml-1 font-medium">R$ {(config.stats?.totalPrizePool || 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Ganhadores:</span>
                  <span className="ml-1 font-medium">{config.stats?.winnersCount || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Finalizada em:</span>
                  <span className="ml-1 font-medium">
                    {config.completed_at ? new Date(config.completed_at).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-400">
                Criada em: {new Date(config.created_at).toLocaleDateString('pt-BR')}
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
