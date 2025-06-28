
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Gift, Star } from 'lucide-react';

interface GamifiedInviteStatsProps {
  stats: {
    totalPoints: number;
    activeFriends: number;
    totalInvites: number;
  };
}

const GamifiedInviteStats = ({ stats }: GamifiedInviteStatsProps) => {
  const getPointsLevel = (points: number) => {
    if (points >= 500) return { level: 'Lendário', color: 'from-yellow-400 to-orange-500', icon: '👑' };
    if (points >= 250) return { level: 'Mestre', color: 'from-purple-400 to-purple-600', icon: '🏆' };
    if (points >= 100) return { level: 'Experiente', color: 'from-blue-400 to-blue-600', icon: '⭐' };
    if (points >= 50) return { level: 'Iniciante', color: 'from-green-400 to-green-600', icon: '🌟' };
    return { level: 'Novato', color: 'from-gray-400 to-gray-600', icon: '🎯' };
  };

  const levelInfo = getPointsLevel(stats.totalPoints);

  return (
    <Card className="border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl">
      <CardContent className="p-6">
        {/* Título da Seção */}
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5" />
          <h3 className="font-bold text-lg">Suas Estatísticas</h3>
        </div>

        {/* Status do Jogador */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Seu Nível</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{levelInfo.icon}</span>
                <span className="font-bold text-xl">{levelInfo.level}</span>
              </div>
            </div>
            <Badge className="bg-white/30 text-white border-white/30">
              {stats.totalPoints} XP
            </Badge>
          </div>
        </div>

        {/* Grid de Estatísticas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">
              <Users className="w-6 h-6 text-blue-200" />
            </div>
            <p className="text-2xl font-bold">{stats.activeFriends}</p>
            <p className="text-xs opacity-80">Amigos Ativos</p>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">
              <Gift className="w-6 h-6 text-green-200" />
            </div>
            <p className="text-2xl font-bold">{stats.totalInvites}</p>
            <p className="text-xs opacity-80">Total Convites</p>
          </div>
        </div>

        {/* Próximo Objetivo */}
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Próximo Objetivo</span>
          </div>
          <p className="text-xs opacity-90">
            {stats.activeFriends < 5 
              ? `Convide mais ${5 - stats.activeFriends} amigos para ganhar 100 XP bônus!`
              : 'Parabéns! Você atingiu o objetivo mensal!'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GamifiedInviteStats;
