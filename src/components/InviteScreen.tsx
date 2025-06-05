
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Copy, Gift, Users, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const InviteScreen = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const inviteCode = "ARENA2024";
  const inviteLink = `https://letraarena.com/join/${inviteCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "Link de convite copiado para a área de transferência.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInvite = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Letra Arena - Caça Palavras',
        text: 'Jogue comigo no Letra Arena! O melhor jogo de caça-palavras do Brasil!',
        url: inviteLink,
      });
    } else {
      copyToClipboard();
    }
  };

  const invitedFriends = [
    { name: "Ana Silva", status: "active", reward: true },
    { name: "Carlos Mendes", status: "pending", reward: false },
    { name: "Maria Santos", status: "active", reward: true },
  ];

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-purple-800 mb-2">Convidar Amigos</h1>
        <p className="text-gray-600">Ganhe recompensas especiais</p>
      </div>

      {/* Reward Info */}
      <Card className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
        <CardContent className="p-4 text-center">
          <Gift className="w-8 h-8 mx-auto mb-2" />
          <div className="text-lg font-bold">Recompensa por Convite</div>
          <div className="text-2xl font-bold">100 Pontos</div>
          <div className="text-sm opacity-80">Quando seu amigo jogar por 3 dias</div>
        </CardContent>
      </Card>

      {/* Invite Code */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg text-center">Seu Código de Convite</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 tracking-wider">{inviteCode}</div>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={shareInvite}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              size="lg"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar Convite
            </Button>
            
            <Button 
              onClick={copyToClipboard}
              variant="outline"
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold text-gray-800">3</div>
            <div className="text-sm text-gray-600">Amigos Convidados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-gray-800">200</div>
            <div className="text-sm text-gray-600">Pontos Ganhos</div>
          </CardContent>
        </Card>
      </div>

      {/* Invited Friends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Amigos Convidados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {invitedFriends.map((friend, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {friend.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">{friend.name}</div>
                  <div className={`text-xs ${friend.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {friend.status === 'active' ? 'Ativo' : 'Pendente'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {friend.reward && (
                  <div className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                    +100pts
                  </div>
                )}
                <div className={`w-3 h-3 rounded-full ${friend.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              </div>
            </div>
          ))}
          
          {invitedFriends.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Você ainda não convidou nenhum amigo</p>
              <p className="text-sm">Compartilhe seu código e ganhe pontos!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteScreen;
