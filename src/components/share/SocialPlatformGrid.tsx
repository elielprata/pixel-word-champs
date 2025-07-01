
import React from 'react';

interface SocialPlatformGridProps {
  shareText: string;
  shareUrl: string;
  onCopy: () => void;
}

const SocialPlatformGrid = ({ shareText, shareUrl, onCopy }: SocialPlatformGridProps) => {
  const shareOnPlatform = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      case 'instagram':
        onCopy();
        return;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const platforms = [
    { id: 'whatsapp', name: 'WhatsApp', color: 'bg-green-500 hover:bg-green-600', emoji: '📱' },
    { id: 'telegram', name: 'Telegram', color: 'bg-blue-500 hover:bg-blue-600', emoji: '✈️' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700', emoji: '👥' },
    { id: 'twitter', name: 'Twitter', color: 'bg-sky-500 hover:bg-sky-600', emoji: '🐦' },
    { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600', emoji: '📸' }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {platforms.map((platform) => (
        <button
          key={platform.id}
          onClick={() => shareOnPlatform(platform.id)}
          className={`
            flex items-center justify-center gap-2 p-3 rounded-xl text-white font-bold text-sm
            transition-all duration-300 hover-lift active-press shadow-lg hover:shadow-xl
            ${platform.color}
          `}
        >
          <span className="text-lg">{platform.emoji}</span>
          <span>{platform.name}</span>
        </button>
      ))}
    </div>
  );
};

export default SocialPlatformGrid;
