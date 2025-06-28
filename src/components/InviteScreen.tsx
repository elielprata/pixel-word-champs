
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
import MyInviteRanking from './invite/MyInviteRanking';
import MyInvitedFriends from './invite/MyInvitedFriends';
import MonthlyPrizeDisplay from './invite/MonthlyPrizeDisplay';
import CompactInviteInfo from './invite/CompactInviteInfo';
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

  // Buscar dados da competição mensal
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

        {/* Premiação do Mês - SEMPRE exibir, mesmo durante carregamento */}
        <MonthlyPrizeDisplay 
          configuredPrizes={monthlyData?.stats?.configuredPrizes || []}
        />

        {/* Minha Posição no Ranking */}
        <MyInviteRanking />

        {/* Estatísticas Compactas com Código de Convite */}
        <CompactInviteInfo 
          stats={stats}
          inviteCode={inviteCode}
          onCopyCode={handleCopyCode}
        />

        {/* Competição Mensal */}
        <div className="mb-6">
          <MonthlyInviteCompetition suppressLoading={true} />
        </div>

        {/* Meus Amigos Indicados */}
        <MyInvitedFriends invitedFriends={invitedFriends} />
      </div>
    </div>
  );
};

export default InviteScreen;
