
import React from 'react';
import { ArrowLeft, Trophy, Target, Calendar, Award, Flame, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PlayerAvatar from '@/components/ui/PlayerAvatar';
import ScoreDisplay from '@/components/ui/ScoreDisplay';
import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { useAppNavigation } from '@/hooks/useAppNavigation';

const ProfileScreen = () => {
  const { user } = useAuth();
  const { stats, isLoading } = useUserStats();
  const { navigateToScreen } = useAppNavigation();

  const goHome = () => {
    navigateToScreen('home');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Usuário não encontrado</p>
          <Button onClick={goHome} className="mt-4">
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const achievements = [
    {
      id: 1,
      title: "Primeiro Jogo",
      description: "Complete seu primeiro jogo",
      icon: Target,
      completed: stats.gamesPlayed > 0,
      progress: stats.gamesPlayed > 0 ? 100 : 0
    },
    {
      id: 2,
      title: "Pontuador",
      description: "Alcance 1000 pontos",
      icon: Star,
      completed: stats.totalScore >= 1000,
      progress: Math.min((stats.totalScore / 1000) * 100, 100)
    },
    {
      id: 3,
      title: "Veterano",
      description: "Jogue 10 partidas",
      icon: Calendar,
      completed: stats.gamesPlayed >= 10,
      progress: Math.min((stats.gamesPlayed / 10) * 100, 100)
    },
    {
      id: 4,
      title: "Sequência",
      description: "Mantenha uma sequência de 3 dias",
      icon: Flame,
      completed: stats.winStreak >= 3,
      progress: Math.min((stats.winStreak / 3) * 100, 100)
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={goHome}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
          </div>

          <div className="flex items-center gap-4">
            <PlayerAvatar 
              src={user.avatar_url} 
              alt={user.username}
              fallback={user.username.substring(0, 2).toUpperCase()}
              size="lg"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p className="text-purple-100">{user.email}</p>
              {stats.position && (
                <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
                  #{stats.position} no Ranking
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Estatísticas Principais */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <ScoreDisplay score={stats.totalScore} size="lg" />
              <p className="text-sm text-gray-600 mt-1">Pontuação Total</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.gamesPlayed}</div>
              <p className="text-sm text-gray-600">Jogos Completos</p>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas Detalhadas */}
        <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Estatísticas Detalhadas
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Posição Atual</span>
                <span className="font-medium">
                  {stats.position ? `#${stats.position}` : 'Não classificado'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Melhor Posição</span>
                <span className="font-medium">
                  {stats.bestWeeklyPosition ? `#${stats.bestWeeklyPosition}` : 'Nenhuma'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sequência Atual</span>
                <span className="font-medium flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {stats.winStreak} dias
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Conquistas
            </h3>
            
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`p-2 rounded-full ${
                      achievement.completed 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{achievement.title}</h4>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    {achievement.completed && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        Completo
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileScreen;
