
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy, RefreshCw } from 'lucide-react';
import { logger } from '@/utils/logger';

interface Competition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants?: number;
}

interface DailyCompetitionsViewProps {
  competitions: Competition[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const DailyCompetitionsView = ({ competitions, isLoading, onRefresh }: DailyCompetitionsViewProps) => {
  logger.debug('Renderizando view de competições diárias', { 
    competitionsCount: competitions.length,
    isLoading 
  }, 'DAILY_COMPETITIONS_VIEW');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'finished': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'pending': return 'Pendente';
      case 'finished': return 'Finalizada';
      default: return status;
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
    logger.debug('Carregando competições diárias...', undefined, 'DAILY_COMPETITIONS_VIEW');
    return (
      <div className="grid gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-slate-200 shadow-sm animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (competitions.length === 0) {
    logger.debug('Nenhuma competição diária encontrada', undefined, 'DAILY_COMPETITIONS_VIEW');
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Nenhuma Competição Diária
          </h3>
          <p className="text-slate-600 mb-4">
            Não há competições diárias configuradas no momento.
          </p>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {competitions.map((competition) => (
        <Card key={competition.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  {competition.title}
                </CardTitle>
                <p className="text-sm text-slate-600">
                  {competition.description}
                </p>
              </div>
              <Badge className={getStatusColor(competition.status)}>
                {getStatusLabel(competition.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-slate-500">Início</p>
                  <p className="font-medium text-slate-900">
                    {formatDate(competition.start_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-slate-500">Fim</p>
                  <p className="font-medium text-slate-900">
                    {formatDate(competition.end_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-slate-500">Participantes</p>
                  <p className="font-medium text-slate-900">
                    {competition.total_participants || 0}/{competition.max_participants}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-slate-500">Prêmio</p>
                  <p className="font-medium text-slate-900">
                    {competition.prize_pool} pts
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
