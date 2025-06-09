
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, Crown, Clock } from 'lucide-react';

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
}

export const WeeklyCompetitionsView: React.FC<WeeklyCompetitionsViewProps> = ({
  competitions,
  activeCompetition,
  isLoading
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      <div className="text-center py-12 text-slate-500">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p className="font-medium mb-2">Nenhuma competição semanal ativa</p>
        <p className="text-sm">As competições semanais aparecerão aqui quando criadas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Competição Ativa em Destaque */}
      {activeCompetition && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-green-600" />
                Competição Ativa
              </CardTitle>
              <Badge className={getStatusColor(activeCompetition.status)}>
                {getStatusText(activeCompetition.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-green-800">{activeCompetition.title}</h3>
                <p className="text-green-700 text-sm">{activeCompetition.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Início</p>
                    <p className="text-green-700">{formatDate(activeCompetition.start_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Fim</p>
                    <p className="text-green-700">{formatDate(activeCompetition.end_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Prêmio</p>
                    <p className="text-green-700 font-semibold">R$ {activeCompetition.prize_pool.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Participantes</p>
                    <p className="text-green-700">{activeCompetition.total_participants}/{activeCompetition.max_participants}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Todas as Competições */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-600" />
          Todas as Competições Semanais
        </h3>
        
        <div className="grid gap-4">
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
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3">{competition.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span>{formatDate(competition.start_date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{formatDate(competition.end_date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-yellow-600" />
                        <span className="font-semibold">R$ {competition.prize_pool.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-slate-500" />
                        <span>{competition.total_participants}/{competition.max_participants}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
