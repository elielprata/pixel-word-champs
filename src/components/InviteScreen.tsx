
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import { useInvites } from '@/hooks/useInvites';
import { useAuth } from '@/hooks/useAuth';
import LoadingState from './home/LoadingState';
import MonthlyInviteCompetition from './MonthlyInviteCompetition';
import { logger } from '@/utils/logger';
import InviteHeader from './invite/InviteHeader';
import UnauthenticatedView from './invite/UnauthenticatedView';
import ErrorView from './invite/ErrorView';
import GamifiedInviteStats from './invite/GamifiedInviteStats';
import MyInviteRanking from './invite/MyInviteRanking';
import MyInviteCode from './invite/MyInviteCode';
import MyInvitedFriends from './invite/MyInvitedFriends';
import MonthlyPrizeDisplay from './invite/MonthlyPrizeDisplay';
import { useMonthlyInviteCompetitionSimplified } from '@/hooks/useMonthlyInviteCompetitionSimplified';

const InviteScreen = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const {
    inviteCode,
    invitedFriends,
    stats,
    isLoading,
    error
  } = useInvites();

  // Buscar dados da competição mensal para premiação
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyInviteCompetitionSimplified();

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
    return <LoadingState />;
  }

  if (error) {
    logger.error('Erro na tela de convites', { 
      error,
      userId: user?.id 
    }, 'INVITE_SCREEN');
    
    return <ErrorView error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-3 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        <InviteHeader />

        {/* Premiação do Mês */}
        {!monthlyLoading && monthlyData && (
          <MonthlyPrizeDisplay 
            topPerformers={monthlyData.stats?.topPerformers || []}
            totalPrizePool={0}
          />
        )}

        {/* Minha Posição no Ranking */}
        <MyInviteRanking />

        {/* Estatísticas Gamificadas */}
        <GamifiedInviteStats stats={stats} />

        {/* Competição Mensal */}
        <div className="mb-6">
          <MonthlyInviteCompetition suppressLoading={true} />
        </div>

        {/* Meu Código de Convite */}
        <MyInviteCode 
          inviteCode={inviteCode}
          onCopyCode={handleCopyCode}
        />

        {/* Meus Amigos Indicados */}
        <MyInvitedFriends invitedFriends={invitedFriends} />
      </div>
    </div>
  );
};

export default InviteScreen;
