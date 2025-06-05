
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, X, Share2 } from 'lucide-react';
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
      title: "Copiado!",
      description: "Mensagem copiada para a área de transferência.",
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
      case 'linkedin':
        shareUrlPlatform = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`;
        break;
      case 'reddit':
        shareUrlPlatform = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
        break;
      case 'pinterest':
        shareUrlPlatform = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`;
        break;
      case 'tumblr':
        shareUrlPlatform = `https://www.tumblr.com/widgets/share/tool?posttype=link&title=${encodedText}&content=${encodedUrl}`;
        break;
      case 'instagram':
        copyToClipboard();
        toast({
          title: "Texto copiado!",
          description: "Cole no Instagram Stories ou posts.",
        });
        return;
      case 'tiktok':
        copyToClipboard();
        toast({
          title: "Texto copiado!",
          description: "Cole no TikTok para compartilhar.",
        });
        return;
      case 'discord':
        copyToClipboard();
        toast({
          title: "Texto copiado!",
          description: "Cole no Discord para compartilhar.",
        });
        return;
      case 'email':
        shareUrlPlatform = `mailto:?subject=${encodeURIComponent('Jogue Letra Arena comigo!')}&body=${encodeURIComponent(fullMessage)}`;
        break;
      case 'sms':
        shareUrlPlatform = `sms:?body=${encodeURIComponent(fullMessage)}`;
        break;
    }
    
    if (shareUrlPlatform) {
      window.open(shareUrlPlatform, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto border-0 bg-white shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-gray-800">Compartilhar Convite</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview da mensagem */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-700">{shareText}</p>
            <p className="text-sm text-purple-600 mt-2 font-medium">{shareUrl}</p>
          </div>

          {/* Botão de copiar */}
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
                Copiar Mensagem
              </>
            )}
          </Button>
          
          {/* Redes Sociais Principais */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Compartilhar em:</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => shareOnSocial('whatsapp')}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <span className="font-bold text-sm">📱</span>
                <span className="text-sm">WhatsApp</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('telegram')}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <span className="font-bold text-sm">✈️</span>
                <span className="text-sm">Telegram</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('facebook')}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <span className="font-bold text-sm">📘</span>
                <span className="text-sm">Facebook</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('twitter')}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors"
              >
                <span className="font-bold text-sm">🐦</span>
                <span className="text-sm">Twitter</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('instagram')}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                <span className="font-bold text-sm">📷</span>
                <span className="text-sm">Instagram</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('tiktok')}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
              >
                <span className="font-bold text-sm">🎵</span>
                <span className="text-sm">TikTok</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('linkedin')}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
              >
                <span className="font-bold text-sm">💼</span>
                <span className="text-sm">LinkedIn</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('discord')}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <span className="font-bold text-sm">🎮</span>
                <span className="text-sm">Discord</span>
              </button>
            </div>
            
            {/* Outras opções */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t">
              <button
                onClick={() => shareOnSocial('reddit')}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
              >
                <span className="font-bold text-sm">🔗</span>
                <span className="text-sm">Reddit</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('pinterest')}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <span className="font-bold text-sm">📌</span>
                <span className="text-sm">Pinterest</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('email')}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                <span className="font-bold text-sm">📧</span>
                <span className="text-sm">Email</span>
              </button>
              
              <button
                onClick={() => shareOnSocial('sms')}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <span className="font-bold text-sm">💬</span>
                <span className="text-sm">SMS</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialShareModal;
