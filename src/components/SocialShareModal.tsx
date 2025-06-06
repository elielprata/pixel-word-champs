
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ShareHeader from './share/ShareHeader';
import InviteCodeDisplay from './share/InviteCodeDisplay';
import MessagePreview from './share/MessagePreview';
import CopyButton from './share/CopyButton';
import SocialPlatformGrid from './share/SocialPlatformGrid';
import RewardTip from './share/RewardTip';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
  shareText: string;
  shareUrl: string;
}

const SocialShareModal = ({ isOpen, onClose, inviteCode, shareText, shareUrl }: SocialShareModalProps) => {
  if (!isOpen) return null;

  const fullMessage = `${shareText} ${shareUrl}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullMessage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border-0 bg-white shadow-2xl animate-scale-in">
        <ShareHeader onClose={onClose} />
        
        <CardContent className="p-4 space-y-4">
          <InviteCodeDisplay inviteCode={inviteCode} />
          <MessagePreview shareText={shareText} shareUrl={shareUrl} />
          <CopyButton fullMessage={fullMessage} />
          <SocialPlatformGrid 
            shareText={shareText} 
            shareUrl={shareUrl} 
            onCopy={copyToClipboard}
          />
          <RewardTip />
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialShareModal;
