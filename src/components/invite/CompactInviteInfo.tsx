
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Gift, Star, Zap, Crown, Copy } from 'lucide-react';

interface CompactInviteInfoProps {
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
  inviteCode: string;
  onCopyCode: () => void;
}

const CompactInviteInfo = ({ stats, inviteCode, onCopyCode }: CompactInviteInfoProps) => {
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

  if (!inviteCode) return null;

  return (
    <Card className="border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl">
      <CardContent className="p-6">
        {/* Cabeçalho Unificado */}
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5" />
          <h3 className="font-bold text-lg">Suas Estatísticas & Código Mágico</h3>
        </div>

        {/* Seção Superior: Nível e Código lado a lado */}
        <div className="flex gap-4 mb-4">
          {/* Nível do Usuário */}
          <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{levelInfo.icon}</span>
                <div>
                  <span className="font-bold text-sm">{levelInfo.level}</span>
                  <span className="text-xs opacity-75 ml-1">Nv. {currentLevel}</span>
                </div>
              </div>
              <Badge className="bg-white/30 text-white border-white/30 text-xs">
                {stats.totalPoints} XP
              </Badge>
            </div>
            
            <div className="mt-2">
              <div className="flex justify-between text-xs opacity-90 mb-1">
                <span>Nv. {currentLevel}</span>
                <span>Nv. {nextLevel}</span>
              </div>
              <Progress 
                value={levelProgress} 
                className="h-1.5 bg-white/20"
              />
            </div>
          </div>

          {/* Código Mágico */}
          <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-1 mb-2">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium">Seu Código</span>
            </div>
            <div className="text-center mb-2">
              <p className="text-lg font-bold tracking-wider">{inviteCode}</p>
            </div>
            <Button 
              onClick={onCopyCode}
              size="sm"
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0 text-white text-xs h-7"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copiar
            </Button>
          </div>
        </div>

        {/* Grid de Estatísticas (2x2) */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <Users className="w-5 h-5 text-blue-200" />
            </div>
            <p className="text-lg font-bold">{stats.activeFriends}</p>
            <p className="text-xs opacity-80">Amigos Ativos</p>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <Gift className="w-5 h-5 text-green-200" />
            </div>
            <p className="text-lg font-bold">{stats.totalInvites}</p>
            <p className="text-xs opacity-80">Total Convites</p>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <Crown className="w-5 h-5 text-yellow-300" />
            </div>
            <p className="text-lg font-bold">{stats.monthlyPoints || 0}</p>
            <p className="text-xs opacity-80">Pontos no Mês</p>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <Zap className="w-5 h-5 text-yellow-300" />
            </div>
            <p className="text-lg font-bold">50</p>
            <p className="text-xs opacity-80">XP por Cadastro</p>
          </div>
        </div>

        {/* Seção Final: Próximo Objetivo */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Próximo Objetivo</span>
          </div>
          <p className="text-xs opacity-90">
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

export default CompactInviteInfo;
