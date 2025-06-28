
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Gift, Star, RefreshCw } from 'lucide-react';
import { useMonthlyInviteCompetition } from '@/hooks/useMonthlyInviteCompetition';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import LoadingState from './home/LoadingState';

const MonthlyInviteCompetition = () => {
  const { data, isLoading, error, refreshRanking } = useMonthlyInviteCompetition();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleRefresh = async () => {
    const result = await refreshRanking();
    if (result.success) {
      toast({
        title: "Ranking atualizado",
        description: "Os dados da competição foram atualizados com sucesso.",
      });
    } else {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o ranking.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2">Competição Mensal de Indicações</h3>
          <p className="text-gray-600">Faça login para participar da competição mensal</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Erro ao carregar</h3>
          <p className="text-gray-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { userPoints, competition, rankings, userPosition, stats } = data;
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Gift className="w-6 h-6" />
                Competição Mensal de Indicações
              </CardTitle>
              <p className="text-purple-100 mt-2">{currentMonth}</p>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleRefresh}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{userPoints.invite_points}</div>
            <div className="text-sm text-gray-600">Pontos do Mês</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{userPoints.invites_count}</div>
            <div className="text-sm text-gray-600">Convites Enviados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{userPoints.active_invites_count}</div>
            <div className="text-sm text-gray-600">Amigos Ativos</div>
          </CardContent>
        </Card>
      </div>

      {/* User Position */}
      {userPosition && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {userPosition.position}
                </div>
                <div>
                  <h3 className="font-semibold">Sua Posição</h3>
                  <p className="text-sm text-gray-600">
                    {userPosition.position}º lugar com {userPosition.invite_points} pontos
                  </p>
                </div>
              </div>
              {userPosition.prize_amount > 0 && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Prêmio: R$ {userPosition.prize_amount}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competition Info */}
      {competition && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Informações da Competição
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Status:</span>
                <Badge 
                  variant={competition.status === 'active' ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {competition.status === 'active' ? 'Ativa' : 
                   competition.status === 'completed' ? 'Finalizada' : 'Agendada'}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-gray-600">Participantes: </span>
                <span className="font-semibold">{stats.totalParticipants}</span>
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-600">Período: </span>
              <span className="font-semibold">
                {new Date(competition.start_date).toLocaleDateString('pt-BR')} até{' '}
                {new Date(competition.end_date).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      {stats.topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Top 3 do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                    }`}>
                      {performer.position}
                    </div>
                    <div>
                      <p className="font-medium">{performer.username}</p>
                      <p className="text-sm text-gray-600">
                        {performer.active_invites_count} amigos ativos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{performer.invite_points} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <p className="text-sm">Convide amigos usando seu código de indicação</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <p className="text-sm">Ganhe 50 pontos por cada amigo que se cadastrar</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <p className="text-sm">Pontos extras quando seus amigos começam a jogar</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <p className="text-sm">Compete no ranking mensal por prêmios exclusivos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyInviteCompetition;
