
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Users, Gift, Star, Trophy, Zap, Crown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const InviteScreen = () => {
  const [inviteCode] = useState('ARENA2024XYZ');
  const { toast } = useToast();

  const shareText = `Jogue Letra Arena comigo! Use meu código ${inviteCode} e ganhe bônus especiais! 🎮`;
  const shareUrl = `https://letraarena.com/convite/${inviteCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Código copiado!",
      description: "Compartilhe com seus amigos para ganhar recompensas.",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Letra Arena',
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({
        title: "Link copiado!",
        description: "Cole onde quiser para compartilhar.",
      });
    }
  };

  const invitedFriends = [
    { name: "Ana Silva", status: "Ativo", reward: 50, level: 3 },
    { name: "Pedro Costa", status: "Pendente", reward: 0, level: 0 },
    { name: "Maria Santos", status: "Ativo", reward: 50, level: 5 },
  ];

  const totalRewards = invitedFriends.reduce((sum, friend) => sum + friend.reward, 0);
  const activeInvites = invitedFriends.filter(f => f.status === 'Ativo').length;
  const nextRewardAt = Math.ceil((activeInvites + 1) / 5) * 5;
  const progressToNextReward = (activeInvites % 5) / 5;

  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-16 w-24 h-24 bg-blue-400/10 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-purple-400/10 rounded-full blur-lg animate-pulse"></div>
      </div>

      <div className="relative z-10">
        {/* Header com elementos gamificados */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Crown className="w-12 h-12 text-yellow-400 animate-bounce" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">{activeInvites}</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Arena de Convites
          </h1>
          <p className="text-gray-300">Recrute aliados e desbloqueie recompensas épicas</p>
        </div>

        {/* Stats gamificadas */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">{totalRewards}</div>
              <div className="text-xs text-gray-300">XP Total</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400">{activeInvites}</div>
              <div className="text-xs text-gray-300">Aliados Ativos</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400">{Math.floor(activeInvites / 5)}</div>
              <div className="text-xs text-gray-300">Conquistas</div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de progresso para próxima recompensa */}
        <Card className="mb-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Próxima Recompensa Épica</span>
              <span className="text-sm text-purple-400 font-bold">{activeInvites}/{nextRewardAt}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${progressToNextReward * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">
              {nextRewardAt - activeInvites} aliados para desbloquear recompensa especial
            </p>
          </CardContent>
        </Card>

        {/* Código de Convite - Estilo Gaming */}
        <Card className="mb-6 bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border-emerald-500/50 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 animate-pulse"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-center flex items-center justify-center gap-2 text-emerald-400">
              <Zap className="w-6 h-6 animate-bounce" />
              Código de Recrutamento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4 relative z-10">
            <div className="bg-black/30 rounded-xl p-6 border border-emerald-500/30">
              <p className="text-3xl font-mono font-bold tracking-wider text-emerald-400 mb-2">{inviteCode}</p>
              <div className="flex items-center justify-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-500/50"
                onClick={handleCopyCode}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Código
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-purple-500/50"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Recompensas */}
        <Card className="mb-6 bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-orange-400 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Sistema de Recompensas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { milestone: 1, reward: "50 XP + Badge Recruta", icon: "🥉" },
              { milestone: 3, reward: "150 XP + Skin Especial", icon: "🥈" },
              { milestone: 5, reward: "300 XP + Título Lendário", icon: "🥇" },
              { milestone: 10, reward: "500 XP + Acesso VIP", icon: "👑" }
            ].map((tier, index) => (
              <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                activeInvites >= tier.milestone 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-gray-800/30 border border-gray-600/30'
              }`}>
                <div className="text-2xl">{tier.icon}</div>
                <div className="flex-1">
                  <p className={`font-medium ${activeInvites >= tier.milestone ? 'text-green-400' : 'text-gray-400'}`}>
                    {tier.milestone} Aliados
                  </p>
                  <p className="text-sm text-gray-300">{tier.reward}</p>
                </div>
                {activeInvites >= tier.milestone && (
                  <div className="text-green-400 font-bold">✓ Desbloqueado</div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Lista de Aliados */}
        <Card className="bg-gradient-to-br from-slate-900/50 to-gray-900/50 border-slate-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-slate-300">
              <Users className="w-5 h-5" />
              Seus Aliados ({invitedFriends.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitedFriends.length > 0 ? (
              <div className="space-y-3">
                {invitedFriends.map((friend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/50 to-gray-800/50 rounded-lg border border-slate-600/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        friend.status === 'Ativo' ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {friend.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-white">{friend.name}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            friend.status === 'Ativo' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {friend.status}
                          </span>
                          {friend.level > 0 && (
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full border border-purple-500/30">
                              Nível {friend.level}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-400">+{friend.reward} XP</p>
                      {friend.status === 'Ativo' && (
                        <div className="flex items-center gap-1 text-xs text-green-400">
                          <Star className="w-3 h-3 fill-current" />
                          Ativo
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="mb-4">
                  <Users className="w-16 h-16 mx-auto opacity-50" />
                </div>
                <h3 className="text-lg font-medium mb-2">Sua Arena Está Vazia</h3>
                <p className="text-sm mb-4">Recrute seus primeiros aliados para começar a jornada!</p>
                <div className="text-xs text-gray-500">
                  💡 Dica: Compartilhe seu código para ganhar XP e desbloquear recompensas
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteScreen;
