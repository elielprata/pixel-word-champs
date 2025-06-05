
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Calendar, Target, Star, Award, Medal, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AchievementsScreenProps {
  onBack: () => void;
}

const AchievementsScreen = ({ onBack }: AchievementsScreenProps) => {
  const { user } = useAuth();

  const achievements = [
    {
      id: 'first_game',
      title: 'Primeiro Jogo',
      description: 'Complete seu primeiro desafio',
      icon: Target,
      unlocked: (user?.games_played || 0) > 0,
      progress: Math.min((user?.games_played || 0), 1),
      total: 1,
      rarity: 'common',
      points: 10
    },
    {
      id: 'first_points',
      title: 'Primeiros Pontos',
      description: 'Ganhe seus primeiros 100 pontos',
      icon: Star,
      unlocked: (user?.total_score || 0) >= 100,
      progress: Math.min((user?.total_score || 0), 100),
      total: 100,
      rarity: 'common',
      points: 25
    },
    {
      id: 'ten_games',
      title: 'Veterano',
      description: 'Complete 10 jogos',
      icon: Calendar,
      unlocked: (user?.games_played || 0) >= 10,
      progress: Math.min((user?.games_played || 0), 10),
      total: 10,
      rarity: 'uncommon',
      points: 50
    },
    {
      id: 'top_100',
      title: 'Top 100',
      description: 'Entre no top 100 do ranking diário',
      icon: Medal,
      unlocked: (user?.best_daily_position || 999) <= 100,
      progress: user?.best_daily_position ? Math.max(101 - user.best_daily_position, 0) : 0,
      total: 100,
      rarity: 'rare',
      points: 100
    },
    {
      id: 'top_10',
      title: 'Elite',
      description: 'Entre no top 10 do ranking diário',
      icon: Award,
      unlocked: (user?.best_daily_position || 999) <= 10,
      progress: user?.best_daily_position ? Math.max(11 - user.best_daily_position, 0) : 0,
      total: 10,
      rarity: 'epic',
      points: 250
    },
    {
      id: 'podium',
      title: 'Pódio',
      description: 'Termine no top 3 do ranking diário',
      icon: Trophy,
      unlocked: (user?.best_daily_position || 999) <= 3,
      progress: user?.best_daily_position ? Math.max(4 - user.best_daily_position, 0) : 0,
      total: 3,
      rarity: 'legendary',
      points: 500
    },
    {
      id: 'champion',
      title: 'Campeão',
      description: 'Alcance o 1º lugar no ranking diário',
      icon: Crown,
      unlocked: (user?.best_daily_position || 999) === 1,
      progress: user?.best_daily_position === 1 ? 1 : 0,
      total: 1,
      rarity: 'legendary',
      points: 1000
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'uncommon': return 'bg-green-100 text-green-800 border-green-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-purple-800">Conquistas</h1>
          <p className="text-gray-600">Seus troféus e marcos conquistados</p>
        </div>
      </div>

      {/* Stats */}
      <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold mb-2">Progresso Geral</h2>
              <p className="text-sm opacity-90">
                {unlockedAchievements.length} de {achievements.length} conquistas desbloqueadas
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalPoints}</p>
              <p className="text-xs opacity-80">Pontos de Conquista</p>
            </div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Todas as Conquistas</h3>
        
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          const progressPercentage = (achievement.progress / achievement.total) * 100;
          
          return (
            <Card 
              key={achievement.id} 
              className={`border transition-all duration-200 ${
                achievement.unlocked 
                  ? 'bg-white shadow-md hover:shadow-lg' 
                  : 'bg-gray-50 opacity-75'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-bold ${
                        achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRarityColor(achievement.rarity)}`}
                      >
                        {achievement.rarity}
                      </Badge>
                      {achievement.unlocked && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                          +{achievement.points} pts
                        </Badge>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-2 ${
                      achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {!achievement.unlocked && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progresso</span>
                          <span>{achievement.progress} / {achievement.total}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full h-1.5 transition-all duration-300"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsScreen;
