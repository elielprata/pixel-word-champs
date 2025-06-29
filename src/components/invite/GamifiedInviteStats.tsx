
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Gift, Star, Zap, Crown } from 'lucide-react';

interface GamifiedInviteStatsProps {
  stats: {
    totalPoints: number;
    activeFriends: number;
    totalInvites: number;
    monthlyPoints?: number;
    userLevel?: number;
    nextLevel?: number;
    levelProgress?: number;
    totalScore?: number;
    experiencePoints?: number;
  };
}

const GamifiedInviteStats = ({ stats }: GamifiedInviteStatsProps) => {
  const currentLevel = stats.userLevel || 1;
  const nextLevel = stats.nextLevel || 2;
  const levelProgress = stats.levelProgress || 0;
  
  const getLevelInfo = (level: number) => {
    if (level >= 20) return { level: 'Lendário', color: 'from-yellow-400 to-orange-500', icon: '👑', bgColor: 'bg-yellow-100' };
    if (level >= 15) return { level: 'Mestre', color: 'from-purple-400 to-purple-600', icon: '🏆', bgColor: 'bg-purple-100' };
    if (level >= 10) return { level: 'Experiente', color: 'from-blue-400 to-blue-600', icon: '⭐', bgColor: 'bg-blue-100' };
    if (level >= 5) return { level: 'Iniciante', color: 'from-green-400 to-green-600', icon: '🌟', bgColor: 'bg-green-100' };
    return { level: 'Novato', color: 'from-gray-400 to-gray-600', icon: '🎯', bgColor: 'bg-gray-100' };
  };

  const levelInfo = getLevelInfo(currentLevel);

  return (
    <Card className="border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl">
      <CardContent className="p-4 md:p-6">
        {/* Título da Seção */}
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <Trophy className="w-4 h-4 md:w-5 md:h-5" />
          <h3 className="font-bold text-base md:text-lg">Suas Estatísticas</h3>
        </div>

        {/* Status do Jogador com Nível Atualizado */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4 mb-3 md:mb-4">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm opacity-90">Nível Atual</p>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-2xl">{levelInfo.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-bold text-sm md:text-xl truncate">{levelInfo.level}</span>
                    <span className="text-xs md:text-sm opacity-75">Nv. {currentLevel}</span>
                  </div>
                </div>
              </div>
            </div>
            <Badge className="bg-white/30 text-white border-white/30 text-xs md:text-sm shrink-0 ml-2">
              {stats.totalPoints} XP
            </Badge>
          </div>
          
          {/* Barra de Progresso do Nível */}
          <div className="mt-2 md:mt-3">
            <div className="flex justify-between text-xs opacity-90 mb-1">
              <span>Nível {currentLevel}</span>
              <span>Nível {nextLevel}</span>
            </div>
            <Progress 
              value={levelProgress} 
              className="h-2 bg-white/20"
            />
            <p className="text-xs opacity-75 mt-1 text-center">
              {Math.round(levelProgress)}% para o próximo nível
            </p>
          </div>
        </div>

        {/* Grid de Estatísticas Expandido */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 md:p-4 text-center">
            <div className="flex justify-center mb-1 md:mb-2">
              <Users className="w-4 h-4 md:w-6 md:h-6 text-blue-200" />
            </div>
            <p className="text-lg md:text-2xl font-bold">{stats.activeFriends}</p>
            <p className="text-xs opacity-80">Amigos Ativos</p>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 md:p-4 text-center">
            <div className="flex justify-center mb-1 md:mb-2">
              <Gift className="w-4 h-4 md:w-6 md:h-6 text-green-200" />
            </div>
            <p className="text-lg md:text-2xl font-bold">{stats.totalInvites}</p>
            <p className="text-xs opacity-80">Total Convites</p>
          </div>
        </div>

        {/* Estatísticas Mensais */}
        {stats.monthlyPoints !== undefined && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3 md:mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
              <span className="text-xs md:text-sm font-medium">Performance Mensal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs opacity-90">Pontos no mês atual</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-300" />
                <span className="font-bold text-sm">{stats.monthlyPoints}</span>
              </div>
            </div>
          </div>
        )}

        {/* Próximo Objetivo */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
            <span className="text-xs md:text-sm font-medium">Próximo Objetivo</span>
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            {stats.activeFriends < 5 
              ? `Convide mais ${5 - stats.activeFriends} amigos para ganhar 100 XP bônus!`
              : stats.activeFriends < 10
              ? `Convide mais ${10 - stats.activeFriends} amigos para alcançar 10 convites ativos!`
              : 'Parabéns! Você é um mestre dos convites!'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GamifiedInviteStats;
