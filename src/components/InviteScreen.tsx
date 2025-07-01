
import React, { useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInvites } from '@/hooks/useInvites';
import { useEdgeProtection } from '@/utils/edgeProtection';
import { logger } from '@/utils/logger';
import InviteHeader from './invite/InviteHeader';
import MyInviteCode from './invite/MyInviteCode';
import InviteStatsCards from './invite/InviteStatsCards';
import MyInvitedFriends from './invite/MyInvitedFriends';
import HowItWorksCard from './invite/HowItWorksCard';
import UnauthenticatedView from './invite/UnauthenticatedView';

const InviteScreen = () => {
  const { user } = useAuth();
  const inviteRef = useRef<HTMLDivElement>(null);
  
  // ✅ APLICAR PROTEÇÃO DE BORDA NO CONVITE
  useEdgeProtection(inviteRef, true);
  
  const {
    inviteCode,
    stats,
    invitedFriends,
    isLoading,
    error,
    refetch
  } = useInvites();

  logger.debug('Renderizando InviteScreen', { 
    userId: user?.id,
    hasInviteCode: !!inviteCode,
    totalInvites: stats?.totalInvites || 0
  }, 'INVITE_SCREEN');

  if (!user) {
    return <UnauthenticatedView />;
  }

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
    }
  };

  return (
    <div 
      ref={inviteRef}
      className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-3 pb-20 total-edge-protection"
    >
      <div className="max-w-md mx-auto space-y-4">
        <InviteHeader />
        
        <MyInviteCode 
          inviteCode={inviteCode} 
          onCopyCode={handleCopyCode}
        />
        
        <InviteStatsCards 
          stats={stats}
        />
        
        <MyInvitedFriends 
          invitedFriends={invitedFriends}
        />
        
        <HowItWorksCard />
      </div>
    </div>
  );
};

export default InviteScreen;
