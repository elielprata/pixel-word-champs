import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Share2, Copy, Users, Gift, Star, Trophy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import SocialShareModal from './SocialShareModal';

const InviteScreen = () => {
  const [inviteCode] = useState('ARENA2024XYZ');
  const [showShareModal, setShowShareModal] = useState(false);
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
      setShowShareModal(true);
    }
  };

  const invitedFriends = [
    { name: "Ana Silva", status: "Ativo", reward: 50, level: 3 },
    { name: "Pedro Costa", status: "Pendente", reward: 0, level: 0 },
    { name: "Maria Santos", status: "Ativo", reward: 50, level: 2 },
  ];

  const totalPoints = invitedFriends.reduce((sum, friend) => sum + friend.reward, 0);
  const activeFriends = invitedFriends.filter(friend => friend.status === 'Ativo').length;
  const nextRewardAt = 5;
  const progressToNextReward = (activeFriends / nextRewardAt) * 100;

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
            <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
            <div className="text-xs text-gray-600 mt-1">Pontos Ganhos</div>
          </CardContent>
        </Card>
        <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{activeFriends}</div>
            <div className="text-xs text-gray-600 mt-1">Amigos Ativos</div>
          </CardContent>
        </Card>
        <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{invitedFriends.length}</div>
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
              {activeFriends}/{nextRewardAt} amigos
            </Badge>
          </div>
          <Progress value={progressToNextReward} className="h-2 mb-2" />
          <p className="text-sm text-gray-600">
            Convide mais {nextRewardAt - activeFriends} amigos para ganhar <span className="font-semibold text-yellow-600">100 pontos bônus!</span>
          </p>
        </CardContent>
      </Card>

      {/* Invite Code */}
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
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleCopyCode}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0 text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleShare}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="mb-6 border-0 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <p className="text-sm text-gray-700">Compartilhe seu código único</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <p className="text-sm text-gray-700">Amigo se cadastra com seu código</p>
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
                      {friend.name.charAt(0)}
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
              <p className="text-sm">Compartilhe seu código e comece a ganhar!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        inviteCode={inviteCode}
        shareText={shareText}
        shareUrl={shareUrl}
      />
    </div>
  );
};

export default InviteScreen;
