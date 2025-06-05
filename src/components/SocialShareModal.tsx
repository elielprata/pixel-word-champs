
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, X, Share2, Users, Gift } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
  shareText: string;
  shareUrl: string;
}

const SocialShareModal = ({ isOpen, onClose, inviteCode, shareText, shareUrl }: SocialShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const fullMessage = `${shareText} ${shareUrl}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    toast({
      title: "🎉 Copiado com sucesso!",
      description: "Agora é só colar onde quiser compartilhar!",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let shareUrlPlatform = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrlPlatform = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
        break;
      case 'telegram':
        shareUrlPlatform = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        shareUrlPlatform = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        shareUrlPlatform = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullMessage)}`;
        break;
      case 'instagram':
        copyToClipboard();
        toast({
          title: "📸 Texto copiado!",
          description: "Cole no Instagram Stories ou posts para compartilhar!",
        });
        return;
      case 'tiktok':
        copyToClipboard();
        toast({
          title: "🎵 Texto copiado!",
          description: "Cole no TikTok e espalhe a diversão!",
        });
        return;
      case 'discord':
        copyToClipboard();
        toast({
          title: "🎮 Texto copiado!",
          description: "Cole no Discord e chame a galera!",
        });
        return;
    }
    
    if (shareUrlPlatform) {
      window.open(shareUrlPlatform, '_blank', 'width=600,height=400');
    }
  };

  const socialPlatforms = [
    {
      name: 'WhatsApp',
      key: 'whatsapp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Grupos e contatos'
    },
    {
      name: 'Instagram',
      key: 'instagram',
      icon: '📸',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      description: 'Stories e posts'
    },
    {
      name: 'TikTok',
      key: 'tiktok',
      icon: '🎵',
      color: 'bg-black hover:bg-gray-800',
      description: 'Vídeos virais'
    },
    {
      name: 'Facebook',
      key: 'facebook',
      icon: '👥',
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Amigos e família'
    },
    {
      name: 'Twitter',
      key: 'twitter',
      icon: '🐦',
      color: 'bg-sky-500 hover:bg-sky-600',
      description: 'Timeline global'
    },
    {
      name: 'Discord',
      key: 'discord',
      icon: '🎮',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      description: 'Servidores gaming'
    },
    {
      name: 'Telegram',
      key: 'telegram',
      icon: '✈️',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Canais e chats'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border-0 bg-white shadow-2xl animate-scale-in">
        <CardHeader className="pb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Compartilhar & Ganhar</CardTitle>
                <p className="text-sm text-white/80">Convide amigos e ganhe recompensas!</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Código de Convite */}
          <div className="text-center bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border-2 border-dashed border-purple-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Seu Código Especial</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 tracking-widest">{inviteCode}</p>
            <p className="text-xs text-gray-500 mt-1">Cada amigo que usar ganha 50 pontos!</p>
          </div>

          {/* Preview da mensagem */}
          <div className="bg-gray-50 p-4 rounded-xl border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Prévia da mensagem</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{shareText}</p>
            <p className="text-sm text-purple-600 font-medium break-all">{shareUrl}</p>
          </div>

          {/* Botão de copiar destacado */}
          <Button 
            onClick={copyToClipboard}
            className={`w-full h-12 text-base font-semibold transition-all duration-200 ${
              copied 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                ✨ Copiado com sucesso!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                📋 Copiar Mensagem Completa
              </>
            )}
          </Button>
          
          {/* Redes Sociais */}
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-800 mb-1">Onde compartilhar?</h4>
              <p className="text-sm text-gray-600">Escolha sua plataforma favorita</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {socialPlatforms.map((platform) => (
                <button
                  key={platform.key}
                  onClick={() => shareOnSocial(platform.key)}
                  className={`${platform.color} text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">{platform.icon}</span>
                    <div className="text-center">
                      <span className="block text-sm font-semibold">{platform.name}</span>
                      <span className="block text-xs opacity-80">{platform.description}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dica de recompensa */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Gift className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-yellow-800">Dica de Ouro</span>
            </div>
            <p className="text-xs text-yellow-700">
              Quanto mais amigos convidar, maiores serão suas recompensas! 
              Cada amigo ativo te dá <span className="font-semibold">50 pontos bônus</span>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialShareModal;
