
import React from 'react';
import { useToast } from "@/hooks/use-toast";

interface SocialPlatform {
  name: string;
  key: string;
  icon: string;
  color: string;
  description: string;
}

interface SocialPlatformGridProps {
  shareText: string;
  shareUrl: string;
  onCopy: () => void;
}

const SocialPlatformGrid = ({ shareText, shareUrl, onCopy }: SocialPlatformGridProps) => {
  const { toast } = useToast();

  const socialPlatforms: SocialPlatform[] = [
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

  const shareOnSocial = (platform: string) => {
    const fullMessage = `${shareText} ${shareUrl}`;
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
        onCopy();
        toast({
          title: "📸 Texto copiado!",
          description: "Cole no Instagram Stories ou posts para compartilhar!",
        });
        return;
      case 'tiktok':
        onCopy();
        toast({
          title: "🎵 Texto copiado!",
          description: "Cole no TikTok e espalhe a diversão!",
        });
        return;
      case 'discord':
        onCopy();
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

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h4 className="text-lg font-semibold text-gray-800 mb-1">Onde compartilhar?</h4>
        <p className="text-sm text-gray-600">Escolha sua plataforma favorita</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {socialPlatforms.map((platform) => (
          <button
            key={platform.key}
            onClick={() => shareOnSocial(platform.key)}
            className={`${platform.color} text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl">{platform.icon}</span>
              <div className="text-center">
                <span className="block text-sm font-semibold">{platform.name}</span>
                <span className="block text-xs opacity-80">{platform.description}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialPlatformGrid;
