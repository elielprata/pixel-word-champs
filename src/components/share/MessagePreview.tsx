
import React from 'react';
import { Users } from 'lucide-react';

interface MessagePreviewProps {
  shareText: string;
  shareUrl: string;
}

const MessagePreview = ({ shareText, shareUrl }: MessagePreviewProps) => {
  return (
    <div className="bg-gray-50 p-2 rounded-lg border">
      <div className="flex items-center gap-1 mb-1">
        <Users className="w-3 h-3 text-gray-600" />
        <span className="text-xs font-medium text-gray-700">Prévia da mensagem</span>
      </div>
      <p className="text-xs text-gray-700 mb-1">{shareText}</p>
      <p className="text-xs text-purple-600 font-medium break-all">{shareUrl}</p>
    </div>
  );
};

export default MessagePreview;
