
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, DollarSign, Clock, Crown } from 'lucide-react';
import { useAdvancedWeeklyStats } from '@/hooks/useAdvancedWeeklyStats';

export const AdvancedWeeklyStats = () => {
  const { data: stats, isLoading, error } = useAdvancedWeeklyStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="text-red-600 text-sm">Erro ao carregar estatísticas avançadas</div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Participantes Ativos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_participants}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Pool de Prêmios</p>
                <p className="text-2xl font-bold text-green-600">R$ {stats.total_prize_pool}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Início da Semana</p>
                <p className="text-lg font-bold text-purple-600">{formatDate(stats.current_week_start)}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Última Atualização</p>
                <p className="text-sm font-bold text-orange-600">
                  {new Date(stats.last_update).toLocaleTimeString('pt-BR')}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Período da Competição */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-slate-600" />
            Período da Competição Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Início:</span>
            <Badge variant="outline">{formatDate(stats.current_week_start)}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Fim:</span>
            <Badge variant="outline">{formatDate(stats.current_week_end)}</Badge>
          </div>
          {stats.config && (
            <div className="pt-2 border-t">
              <div className="text-sm text-slate-600 space-y-1">
                <div>Dia de início: {stats.config.start_day_of_week} (Domingo = 0)</div>
                <div>Duração: {stats.config.duration_days} dias</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 3 Jogadores */}
      {stats.top_3_players.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Top 3 Jogadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.top_3_players.map((player, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      player.position === 1 ? 'bg-yellow-500 text-white' :
                      player.position === 2 ? 'bg-gray-400 text-white' :
                      'bg-orange-600 text-white'
                    }`}>
                      {player.position}
                    </div>
                    <div>
                      <div className="font-medium">{player.username}</div>
                      <div className="text-sm text-slate-600">{player.score} pontos</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">R$ {player.prize}</div>
                    <div className="text-xs text-slate-500">prêmio</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
