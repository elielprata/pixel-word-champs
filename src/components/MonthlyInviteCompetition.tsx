
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Calendar, Star, Gift, Timer } from 'lucide-react';
import { useMonthlyInviteCompetition } from '@/hooks/useMonthlyInviteCompetition';
import LoadingState from './home/LoadingState';

const MonthlyInviteCompetition = () => {
  const { data, isLoading, error } = useMonthlyInviteCompetition();

  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingState />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4 text-center">
          <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-orange-700 font-medium">Competição Mensal Indisponível</p>
          <p className="text-sm text-orange-600 mt-1">
            {error || 'Não foi possível carregar os dados da competição'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { userPoints, competition, rankings, userPosition, stats } = data;
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  
  // Calculate days remaining in month
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate progress to next milestone
  const nextMilestone = Math.ceil(userPoints.invite_points / 250) * 250;
  const milestoneProgress = nextMilestone > 0 ? (userPoints.invite_points / nextMilestone) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Competition Header */}
      <Card className="border-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Competição de Indicações</CardTitle>
                <p className="text-purple-100 text-sm">{currentMonth}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Timer className="w-4 h-4" />
                <span className="text-sm">{daysRemaining} dias restantes</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* User Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Gift className="w-5 h-5 text-green-600 mr-1" />
              <span className="text-2xl font-bold text-green-700">
                {userPoints.invite_points}
              </span>
            </div>
            <p className="text-sm text-green-600">Pontos Mensais</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-blue-600 mr-1" />
              <span className="text-2xl font-bold text-blue-700">
                {userPosition?.position || '--'}
              </span>
            </div>
            <p className="text-sm text-blue-600">Posição Atual</p>
          </CardContent>
        </Card>
      </div>

      {/* User Position Card */}
      {userPosition && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-purple-800">
                  Você está em {userPosition.position}º lugar
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={userPosition.prize_amount > 0 ? 'default' : 'secondary'}
                    className={userPosition.prize_amount > 0 ? 'bg-green-100 text-green-700' : ''}
                  >
                    {userPosition.prize_amount > 0 
                      ? `Prêmio: R$ ${userPosition.prize_amount}` 
                      : 'Sem prêmio'
                    }
                  </Badge>
                </div>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress to Next Milestone */}
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-800">Próximo Marco</span>
            <span className="text-sm text-gray-600">
              {userPoints.invite_points}/{nextMilestone} pontos
            </span>
          </div>
          <Progress value={milestoneProgress} className="h-2 mb-2" />
          <p className="text-xs text-gray-500">
            Faltam {Math.max(0, nextMilestone - userPoints.invite_points)} pontos para o próximo marco
          </p>
        </CardContent>
      </Card>

      {/* Competition Stats */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Estatísticas da Competição
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {stats.totalParticipants}
              </div>
              <div className="text-xs text-gray-600">Participantes</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                R$ {stats.totalPrizePool?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-gray-600">Total em Prêmios</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Rankings */}
      {stats.topPerformers && stats.topPerformers.length > 0 && (
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top 3 do Mês</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {stats.topPerformers.slice(0, 3).map((performer: any, index: number) => (
                <div 
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                    index === 1 ? 'bg-gray-50 border border-gray-200' :
                    'bg-orange-50 border border-orange-200'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800 flex-1">
                    {performer.username}
                  </span>
                  <span className="text-sm font-medium text-purple-600">
                    {performer.invite_points} pts
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MonthlyInviteCompetition;
