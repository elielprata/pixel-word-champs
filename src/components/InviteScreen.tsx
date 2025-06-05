import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Copy, Gift, Users, Check, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const InviteScreen = () => {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { toast } = useToast();
  
  const inviteCode = "ARENA2024";
  const inviteLink = `https://letraarena.com/join/${inviteCode}`;
  const shareText = "Jogue comigo no Letra Arena! O melhor jogo de caça-palavras do Brasil!";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "Link de convite copiado para a área de transferência.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInvite = async () => {
    // Verificar se Web Share API está disponível E se os dados são válidos para compartilhamento
    if (navigator.share) {
      const shareData = {
        title: 'Letra Arena - Caça Palavras',
        text: shareText,
        url: inviteLink,
      };
      
      // Verificar se os dados podem ser compartilhados
      if (navigator.canShare && !navigator.canShare(shareData)) {
        setShowShareModal(true);
        return;
      }
      
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Web Share API falhou, usando modal:', error);
        setShowShareModal(true);
      }
    } else {
      // Web Share API não disponível, usar modal
      setShowShareModal(true);
    }
  };

  const shareOnSocial = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(inviteLink);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'instagram':
        // Instagram não permite compartilhamento direto via URL, então copiamos o texto
        copyToClipboard();
        toast({
          title: "Link copiado!",
          description: "Cole no Instagram Stories ou posts.",
        });
        setShowShareModal(false);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareModal(false);
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

      {/* Modal de Compartilhamento */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Compartilhar</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShareModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => shareOnSocial('whatsapp')}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="text-xs text-gray-600">WhatsApp</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('telegram')}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xs text-gray-600">Telegram</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('facebook')}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span className="text-xs text-gray-600">Facebook</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('twitter')}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-sm">X</span>
                </div>
                <span className="text-xs text-gray-600">Twitter</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('linkedin')}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-sm">in</span>
                </div>
                <span className="text-xs text-gray-600">LinkedIn</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('instagram')}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-sm">IG</span>
                </div>
                <span className="text-xs text-gray-600">Instagram</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteScreen;
