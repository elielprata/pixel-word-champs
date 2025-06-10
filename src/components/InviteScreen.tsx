
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Share2, Copy, Users, Gift, Star, Trophy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import SocialShareModal from './SocialShareModal';
import { useInvites } from '@/hooks/useInvites';
import { useAuth } from '@/hooks/useAuth';
import LoadingState from './home/LoadingState';

const InviteScreen = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const {
    inviteCode,
    invitedFriends,
    stats,
    isLoading,
    error
  } = useInvites();

  const shareText = `Jogue Letra Arena comigo! Use meu código ${inviteCode} e ganhe bônus especiais! 🎮`;
  const shareUrl = `https://letraarena.com/convite/${inviteCode}`;

  const handleCopyCode = () => {
    if (!inviteCode) return;
    
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Código copiado!",
      description: "Compartilhe com seus amigos para ganhar recompensas.",
    });
  };

  const handleShare = async () => {
    if (!inviteCode) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Letra Arena',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Native share failed, showing modal:', error);
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const nextRewardAt = 5;
  const progressToNextReward = (stats.activeFriends / nextRewardAt) * 100;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
        
        <div className="absolute top-20 left-16 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <Card className="text-center p-8 bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="text-white">
            <h2 className="text-xl font-semibold mb-4">Faça login para convidar amigos</h2>
            <p className="text-purple-200">Você precisa estar logado para acessar o sistema de convites.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
        
        <div className="absolute top-20 left-16 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <Card className="text-center p-8 bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="text-white">
            <h2 className="text-xl font-semibold mb-4 text-red-400">Erro ao carregar</h2>
            <p className="text-purple-200">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-16 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
      
      <div className="relative z-10 p-4 pb-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl mb-4 shadow-2xl animate-bounce-in">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
            Convide & Ganhe
          </h1>
          <p className="text-purple-200 text-lg">Transforme amizades em recompensas épicas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.totalPoints}</div>
              <div className="text-xs text-purple-200">Pontos Ganhos</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-blue-400 mb-1">{stats.activeFriends}</div>
              <div className="text-xs text-purple-200">Amigos Ativos</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-green-400 mb-1">{stats.totalInvites}</div>
              <div className="text-xs text-purple-200">Total Convites</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress to Next Reward */}
        <Card className="mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg border-yellow-400/30 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-white">Próxima Recompensa</span>
              </div>
              <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                {stats.activeFriends}/{nextRewardAt} amigos
              </Badge>
            </div>
            <Progress value={progressToNextReward} className="h-3 mb-2 bg-white/20" />
            <p className="text-sm text-purple-200">
              Convide mais {Math.max(0, nextRewardAt - stats.activeFriends)} amigos para ganhar 
              <span className="font-semibold text-yellow-400 ml-1">100 pontos bônus!</span>
            </p>
          </CardContent>
        </Card>

        {/* Invite Code */}
        {inviteCode && (
          <Card className="mb-6 bg-gradient-to-r from-purple-500/30 to-blue-500/30 backdrop-blur-lg border-purple-400/30 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-lg font-semibold text-white">
                Seu Código Especial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                <p className="text-2xl font-bold tracking-widest text-white">{inviteCode}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleCopyCode}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/30 text-white font-semibold"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleShare}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/30 text-white font-semibold"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it Works */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-white">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <p className="text-sm text-purple-200">Compartilhe seu código único</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <p className="text-sm text-purple-200">Amigo se cadastra com seu código</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <p className="text-sm text-purple-200">Ambos ganham 50 pontos após 3 dias</p>
            </div>
          </CardContent>
        </Card>

        {/* Friends List */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Users className="w-5 h-5" />
              Meus Convites ({invitedFriends.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitedFriends.length > 0 ? (
              <div className="space-y-3">
                {invitedFriends.map((friend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {friend.avatar_url ? (
                          <img src={friend.avatar_url} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          friend.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{friend.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={friend.status === 'Ativo' ? 'default' : 'secondary'}
                            className={`text-xs ${friend.status === 'Ativo' ? 'bg-green-500/20 text-green-400 border-green-400/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'}`}
                          >
                            {friend.status}
                          </Badge>
                          {friend.level > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-purple-200">Nível {friend.level}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-400">+{friend.reward}</p>
                      <p className="text-xs text-purple-200">pontos</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-purple-200">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-300" />
                </div>
                <p className="font-medium mb-1 text-white">Nenhum convite ainda</p>
                <p className="text-sm">Compartilhe seu código e comece a ganhar!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Share Modal */}
        {inviteCode && (
          <SocialShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            inviteCode={inviteCode}
            shareText={shareText}
            shareUrl={shareUrl}
          />
        )}
      </div>
    </div>
  );
};

export default InviteScreen;
