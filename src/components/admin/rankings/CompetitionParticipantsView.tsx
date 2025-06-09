
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Trophy, RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { useRealTimeRanking } from '@/hooks/useRealTimeRanking';
import { useParticipationManagement } from '@/hooks/useParticipationManagement';

interface CompetitionParticipantsViewProps {
  competitionId: string;
  competitionTitle: string;
  competitionType: 'challenge' | 'tournament';
}

export const CompetitionParticipantsView: React.FC<CompetitionParticipantsViewProps> = ({
  competitionId,
  competitionTitle,
  competitionType
}) => {
  const { 
    ranking, 
    totalParticipants, 
    isLoading, 
    lastUpdate,
    refreshRanking,
    updatePositions 
  } = useRealTimeRanking(competitionId);

  const { participationProgress } = useParticipationManagement();

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 2: return 'text-gray-600 bg-gray-50 border-gray-200';
      case 3: return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Nunca';
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(lastUpdate);
  };

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Participantes em Tempo Real
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Última atualização: {formatLastUpdate()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={updatePositions}
                disabled={isLoading}
                className="h-8"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{totalParticipants}</div>
              <div className="text-sm text-blue-700">Total de Participantes</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {ranking.filter(r => r.user_score > 0).length}
              </div>
              <div className="text-sm text-green-700">Com Pontuação</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600">
                {competitionType === 'tournament' ? '10' : '0'}
              </div>
              <div className="text-sm text-purple-700">Posições Premiadas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Participantes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Ranking Atual - {competitionTitle}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-slate-600">Carregando participantes...</p>
              </div>
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="font-medium">Nenhum participante ainda</p>
              <p className="text-sm">Os participantes aparecerão aqui quando jogarem na competição.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ranking.slice(0, 50).map((participant, index) => (
                <div 
                  key={`${participant.user_id}-${participant.user_position}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={`w-8 h-6 flex items-center justify-center font-bold ${getPositionColor(participant.user_position)}`}>
                      {participant.user_position}º
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      {participant.profiles?.avatar_url ? (
                        <img 
                          src={participant.profiles.avatar_url} 
                          alt={participant.profiles.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-slate-600">
                            {participant.profiles?.username?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-slate-800">
                        {participant.profiles?.username || 'Usuário'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-slate-800">
                        {participant.user_score.toLocaleString()} pts
                      </div>
                      {competitionType === 'tournament' && participant.user_position <= 10 && (
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          Premiado
                        </div>
                      )}
                    </div>
                    
                    {participant.user_position <= 3 && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
              
              {ranking.length > 50 && (
                <div className="text-center py-3 text-slate-500 text-sm">
                  ... e mais {ranking.length - 50} participantes
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
