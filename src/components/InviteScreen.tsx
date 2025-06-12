
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, Users, Gift, Star, Trophy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useInvites } from '@/hooks/useInvites';
import { useAuth } from '@/hooks/useAuth';
import LoadingState from './home/LoadingState';
import { logger } from '@/utils/logger';

const InviteScreen = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const {
    inviteCode,
    invitedFriends,
    stats,
    isLoading,
    error
  } = useInvites();

  const handleCopyCode = () => {
    if (!inviteCode) return;
    
    navigator.clipboard.writeText(inviteCode);
    logger.info('Código de convite copiado', { 
      userId: user?.id,
      inviteCode: inviteCode?.substring(0, 4) + '***' // Log parcial por segurança
    }, 'INVITE_SCREEN');
    
    toast({
      title: "Código copiado!",
      description: "Compartilhe com seus amigos para ganhar recompensas.",
    });
  };

  const nextRewardAt = 5;
  const progressToNextReward = (stats.activeFriends / nextRewardAt) * 100;

  if (!isAuthenticated) {
    return (
      <div className="p-4 pb-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Faça login para convidar amigos</h2>
            <p className="text-gray-600">Você precisa estar logado para acessar o sistema de convites.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    logger.error('Erro na tela de convites', { 
      error,
      userId: user?.id 
    }, 'INVITE_SCREEN');
    
    return (
      <div className="p-4 pb-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 text-red-600">Erro ao carregar</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  logger.debug('Tela de convites renderizada', { 
    userId: user?.id,
    statsTotal: stats.totalPoints,
    activeFriends: stats.activeFriends,
    hasInviteCode: !!inviteCode
  }, 'INVITE_SCREEN');

  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4 animate-bounce-in">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Convide & Ganhe</h1>
        <p className="text-gray-600">Transforme amizades em recompensas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.totalPoints}</div>
            <div className="text-xs text-gray-600 mt-1">Pontos Ganhos</div>
          </CardContent>
        </Card>
        <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.activeFriends}</div>
            <div className="text-xs text-gray-600 mt-1">Amigos Ativos</div>
          </CardContent>
        </Card>
        <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.totalInvites}</div>
            <div className="text-xs text-gray-600 mt-1">Total Convites</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Reward */}
      <Card className="mb-6 border-0 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-gray-800">Próxima Recompensa</span>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {stats.activeFriends}/{nextRewardAt} amigos
            </Badge>
          </div>
          <Progress value={progressToNextReward} className="h-2 mb-2" />
          <p className="text-sm text-gray-600">
            Convide mais {Math.max(0, nextRewardAt - stats.activeFriends)} amigos para ganhar <span className="font-semibold text-yellow-600">100 pontos bônus!</span>
          </p>
        </CardContent>
      </Card>

      {/* Invite Code */}
      {inviteCode && (
        <Card className="mb-6 border-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg font-semibold">
              Seu Código Especial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-2xl font-bold tracking-widest">{inviteCode}</p>
            </div>
            <div className="flex justify-center">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleCopyCode}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0 text-white px-6"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Código
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How it Works */}
      <Card className="mb-6 border-0 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <p className="text-sm text-gray-700">Copie seu código único</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <p className="text-sm text-gray-700">Amigo se cadastra informando seu código</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <p className="text-sm text-gray-700">Ambos ganham 50 pontos após 3 dias</p>
          </div>
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
            <Users className="w-5 h-5" />
            Meus Convites ({invitedFriends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invitedFriends.length > 0 ? (
            <div className="space-y-3">
              {invitedFriends.map((friend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {friend.avatar_url ? (
                        <img src={friend.avatar_url} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        friend.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{friend.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={friend.status === 'Ativo' ? 'default' : 'secondary'}
                          className={`text-xs ${friend.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                        >
                          {friend.status}
                        </Badge>
                        {friend.level > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">Nível {friend.level}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">+{friend.reward}</p>
                    <p className="text-xs text-gray-500">pontos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-medium mb-1">Nenhum convite ainda</p>
              <p className="text-sm">Copie seu código e convide amigos!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteScreen;
