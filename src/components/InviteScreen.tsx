
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useInviteScreenData } from '@/hooks/useInviteScreenData';
import { InviteScreenSkeleton } from './invite/InviteScreenSkeleton';
import { MonthlyCompetitionWrapper } from './invite/MonthlyCompetitionWrapper';
import { logger } from '@/utils/logger';
import InviteHeader from './invite/InviteHeader';
import InviteStatsCards from './invite/InviteStatsCards';
import ProgressToRewardCard from './invite/ProgressToRewardCard';
import InviteCodeCard from './invite/InviteCodeCard';
import HowItWorksCard from './invite/HowItWorksCard';
import FriendsListCard from './invite/FriendsListCard';
import UnauthenticatedView from './invite/UnauthenticatedView';
import ErrorView from './invite/ErrorView';

const InviteScreen = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const {
    inviteCode,
    invitedFriends,
    stats,
    monthlyCompetition,
    isLoading,
    error,
    useInviteCode
  } = useInviteScreenData();

  const handleCopyCode = () => {
    if (!inviteCode) return;
    
    navigator.clipboard.writeText(inviteCode);
    logger.info('Código de convite copiado', { 
      userId: user?.id,
      inviteCode: inviteCode?.substring(0, 4) + '***'
    }, 'INVITE_SCREEN');
    
    toast({
      title: "Código copiado!",
      description: "Compartilhe com seus amigos para ambos ganharem 50XP!",
    });
  };

  if (!isAuthenticated) {
    return <UnauthenticatedView />;
  }

  if (isLoading) {
    return <InviteScreenSkeleton />;
  }

  if (error) {
    logger.error('Erro na tela de convites', { 
      error,
      userId: user?.id 
    }, 'INVITE_SCREEN');
    
    return <ErrorView error={error} />;
  }

  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen">
      <InviteHeader />

      {/* Monthly Competition Section - Agora controlado centralmente */}
      <div className="mb-6">
        <MonthlyCompetitionWrapper monthlyData={monthlyCompetition} />
      </div>

      <InviteStatsCards stats={stats} />

      <ProgressToRewardCard stats={stats} />

      <InviteCodeCard 
        inviteCode={inviteCode}
        onCopyCode={handleCopyCode}
      />

      <HowItWorksCard />

      <FriendsListCard invitedFriends={invitedFriends} />
    </div>
  );
};

export default InviteScreen;
