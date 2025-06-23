
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Calendar, RefreshCw, Clock } from 'lucide-react';
import { logger } from '@/utils/logger';

interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants?: number;
  competition_type: string;
}

interface WeeklyCompetitionsViewProps {
  competitions: WeeklyCompetition[];
  activeCompetition: WeeklyCompetition | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const WeeklyCompetitionsView = ({ 
  competitions, 
  activeCompetition, 
  isLoading, 
  onRefresh 
}: WeeklyCompetitionsViewProps) => {
  logger.debug('Renderizando view de competições semanais', { 
    competitionsCount: competitions.length,
    hasActiveCompetition: !!activeCompetition,
    isLoading 
  }, 'WEEKLY_COMPETITIONS_VIEW');

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

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (isLoading) {
    logger.debug('Carregando competições semanais...', undefined, 'WEEKLY_COMPETITIONS_VIEW');
    return (
      <div className="space-y-6">
        <Card className="border-slate-200 shadow-sm animate-pulse">
          <CardContent className="p-6">
            <div className="h-32 bg-slate-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Competição Semanal Ativa */}
      {activeCompetition && (
        <Card className="border-purple-200 shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-xl font-bold text-purple-900">
                    {activeCompetition.title}
                  </CardTitle>
                </div>
                <p className="text-purple-700">
                  {activeCompetition.description}
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                {getStatusLabel(activeCompetition.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-purple-600">Início</p>
                  <p className="font-medium text-purple-900">
                    {formatDate(activeCompetition.start_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-purple-600">Restam</p>
                  <p className="font-medium text-purple-900">
                    {getDaysRemaining(activeCompetition.end_date)} dias
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-purple-600">Participantes</p>
                  <p className="font-medium text-purple-900">
                    {activeCompetition.total_participants || 0}/{activeCompetition.max_participants}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-purple-600">Prêmio</p>
                  <p className="font-medium text-purple-900">
                    {activeCompetition.prize_pool} pts
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Todas as Competições */}
      {competitions.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Nenhuma Competição Semanal
            </h3>
            <p className="text-slate-600 mb-4">
              Não há competições semanais configuradas no momento.
            </p>
            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Todas as Competições Semanais
          </h3>
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
                      <p className="text-slate-500">Período</p>
                      <p className="font-medium text-slate-900">
                        {formatDate(competition.start_date)} - {formatDate(competition.end_date)}
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

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-600" />
                    <div>
                      <p className="text-slate-500">Tipo</p>
                      <p className="font-medium text-slate-900">
                        Semanal
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
