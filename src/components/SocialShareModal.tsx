
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ShareHeader from './share/ShareHeader';
import InviteCodeDisplay from './share/InviteCodeDisplay';
import MessagePreview from './share/MessagePreview';
import CopyButton from './share/CopyButton';
import SocialPlatformGrid from './share/SocialPlatformGrid';
import RewardTip from './share/RewardTip';
import { logger } from '@/utils/logger';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
  shareText: string;
  shareUrl: string;
}

const SocialShareModal = ({ isOpen, onClose, inviteCode, shareText, shareUrl }: SocialShareModalProps) => {
  if (!isOpen) return null;

  logger.debug('SocialShareModal renderizado', { 
    inviteCode, 
    hasShareText: !!shareText,
    hasShareUrl: !!shareUrl 
  }, 'SOCIAL_SHARE_MODAL');

  const fullMessage = `${shareText} ${shareUrl}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullMessage);
    logger.info('Mensagem copiada para clipboard', { messageLength: fullMessage.length }, 'SOCIAL_SHARE_MODAL');
  };

  const handleClose = () => {
    logger.debug('Modal de compartilhamento fechado', undefined, 'SOCIAL_SHARE_MODAL');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3 backdrop-blur-sm safe-interactive">
      <Card className="w-full max-w-md max-h-[85vh] overflow-y-auto border-0 bg-white shadow-2xl animate-modal-enter">
        <ShareHeader onClose={handleClose} />
        
        <CardContent className="p-2 space-y-2">
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
