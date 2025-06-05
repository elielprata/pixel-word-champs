
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Users, Gift } from 'lucide-react';
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
    { name: "Ana Silva", status: "Ativo", reward: 50 },
    { name: "Pedro Costa", status: "Pendente", reward: 0 },
    { name: "Maria Santos", status: "Ativo", reward: 50 },
  ];

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">Convide Amigos</h1>
        <p className="text-gray-600">Ganhe recompensas por cada amigo que jogar</p>
      </div>

      {/* Seu Código */}
      <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Gift className="w-6 h-6" />
            Seu Código de Convite
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-2xl font-bold tracking-wide">{inviteCode}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={handleCopyCode}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Como Funciona */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <p className="text-sm text-gray-600">Compartilhe seu código com amigos</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <p className="text-sm text-gray-600">Eles se cadastram usando seu código</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <p className="text-sm text-gray-600">Vocês ganham 50 pontos após 3 dias jogando</p>
          </div>
        </CardContent>
      </Card>

      {/* Amigos Convidados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Amigos Convidados ({invitedFriends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invitedFriends.length > 0 ? (
            <div className="space-y-3">
              {invitedFriends.map((friend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{friend.name}</p>
                    <p className={`text-sm ${friend.status === 'Ativo' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {friend.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">+{friend.reward} pts</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum amigo convidado ainda</p>
              <p className="text-sm">Compartilhe seu código para começar!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteScreen;
