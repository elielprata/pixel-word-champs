
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Gift, Star, Zap, Crown, Copy, Clock } from 'lucide-react';

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
    partialFriends?: number;
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
          {/* Nível do Usuário - Reorganizado */}
          <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{levelInfo.icon}</div>
                <div className="flex flex-col">
                  <span className="font-bold text-base">{levelInfo.level}</span>
                  <span className="text-xs opacity-75">Nível {currentLevel}</span>
                </div>
              </div>
              <Badge className="bg-white/30 text-white border-white/30 text-xs px-3 py-1">
                {stats.totalPoints} XP
              </Badge>
            </div>
            
            {/* Barra de Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs opacity-90">
                <span>Nv. {currentLevel}</span>
                <span>Nv. {nextLevel}</span>
              </div>
              <Progress 
                value={levelProgress} 
                className="h-2 bg-white/20"
              />
              <div className="text-center text-xs opacity-80">
                {Math.round(levelProgress)}% para o próximo nível
              </div>
            </div>
          </div>

          {/* Código Mágico */}
          <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium">Seu Código</span>
            </div>
            <div className="text-center mb-3">
              <p className="text-xl font-bold tracking-wider">{inviteCode}</p>
            </div>
            <Button 
              onClick={onCopyCode}
              size="sm"
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0 text-white text-xs h-8"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copiar Código
            </Button>
          </div>
        </div>

        {/* Grid de Estatísticas (2x2) - Atualizado para novo sistema */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <Users className="w-5 h-5 text-green-200" />
            </div>
            <p className="text-lg font-bold">{stats.activeFriends}</p>
            <p className="text-xs opacity-80">Amigos Ativos</p>
            <p className="text-xs opacity-60">(50 XP cada)</p>
          </div>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <Clock className="w-5 h-5 text-yellow-200" />
            </div>
            <p className="text-lg font-bold">{stats.partialFriends || 0}</p>
            <p className="text-xs opacity-80">Parcialmente Ativos</p>
            <p className="text-xs opacity-60">(5 XP cada)</p>
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
              <Gift className="w-5 h-5 text-blue-200" />
            </div>
            <p className="text-lg font-bold">{stats.totalInvites}</p>
            <p className="text-xs opacity-80">Total Convites</p>
          </div>
        </div>

        {/* Seção Final: Sistema de Recompensas */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Sistema de Recompensas</span>
          </div>
          <div className="text-xs opacity-90 space-y-1">
            <p>• <strong>5 XP imediatos</strong> quando alguém usa seu código</p>
            <p>• <strong>+45 XP extras</strong> quando jogam por 5 dias diferentes</p>
            <p>• <strong>Total: 50 XP</strong> por amigo totalmente ativo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactInviteInfo;
