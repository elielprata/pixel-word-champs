
import React from 'react';
import { Users } from 'lucide-react';

interface MessagePreviewProps {
  shareText: string;
  shareUrl: string;
}

const MessagePreview = ({ shareText, shareUrl }: MessagePreviewProps) => {
  return (
    <div className="bg-gray-50 p-3 rounded-xl border">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Prévia da mensagem</span>
      </div>
      <p className="text-sm text-gray-700 mb-2">{shareText}</p>
      <p className="text-sm text-purple-600 font-medium break-all">{shareUrl}</p>
    </div>
  );
};

export default MessagePreview;
