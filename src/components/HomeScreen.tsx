import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { useProfile } from '@/hooks/useProfile';
import { usePlayerLevel } from '@/hooks/usePlayerLevel';
import { useWeeklyCompetitionAutoParticipation } from '@/hooks/useWeeklyCompetitionAutoParticipation';
import { useWeeklyRankingUpdater } from '@/hooks/useWeeklyRankingUpdater';
import { useOptimizedCompetitions } from '@/hooks/useOptimizedCompetitions';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { usePrizeConfigurations } from '@/hooks/usePrizeConfigurations';
import HomeHeader from './home/HomeHeader';
import UserStatsCard from './home/UserStatsCard';
import CompetitionsList from './home/CompetitionsList';
import LoadingState from './home/LoadingState';
import ErrorState from './home/ErrorState';
import { logger } from '@/utils/logger';
interface HomeScreenProps {
  onStartChallenge: (challengeId: string) => void;
  onViewFullRanking: () => void;
  onViewChallengeRanking: (challengeId: number) => void;
}
const HomeScreen = ({
  onStartChallenge,
  onViewFullRanking
}: HomeScreenProps) => {
  const {
    user
  } = useAuth();
  const {
    stats,
    isLoading: statsLoading
  } = useUserStats();
  const {
    profile,
    isLoading: profileLoading
  } = useProfile();
  const {
    setActiveTab,
    handleNavigateToSettings
  } = useAppNavigation();

  // Usar o hook otimizado que já inclui competições ativas e agendadas
  const {
    competitions,
    isLoading,
    error,
    refetch
  } = useOptimizedCompetitions();

  // Buscar configurações de prêmios reais
  const {
    data: prizeConfigurations,
    isLoading: prizesLoading
  } = usePrizeConfigurations();

  // Manter participação automática e atualização de ranking semanal
  useWeeklyCompetitionAutoParticipation();
  useWeeklyRankingUpdater();

  // Usar sistema real de níveis e títulos baseado nos experience_points
  const totalXP = profile?.experience_points || 0;
  const {
    currentLevel,
    progress
  } = usePlayerLevel(totalXP);

  // Função para calcular prêmio baseado na posição real
  const calculatePrizeForPosition = (position: number) => {
    if (!prizeConfigurations) return {
      amount: 0,
      text: ''
    };

    // Buscar prêmio individual para a posição específica
    const individualPrize = prizeConfigurations.find(config => config.type === 'individual' && config.position === position);
    if (individualPrize) {
      return {
        amount: individualPrize.prize_amount,
        text: `R$ ${individualPrize.prize_amount.toFixed(2).replace('.', ',')}`
      };
    }

    // Buscar prêmio de grupo que inclua esta posição
    const groupPrize = prizeConfigurations.find(config => {
      if (config.type !== 'group' || !config.position_range) return false;
      const [start, end] = config.position_range.split('-').map(Number);
      return position >= start && position <= end;
    });
    if (groupPrize) {
      return {
        amount: groupPrize.prize_amount,
        text: `R$ ${groupPrize.prize_amount.toFixed(2).replace('.', ',')}`
      };
    }
    return {
      amount: 0,
      text: ''
    };
  };
  logger.info('🏠 HomeScreen renderizado', {
    userId: user?.id,
    competitionsCount: competitions.length,
    timestamp: new Date().toISOString()
  }, 'HOME_SCREEN');
  if (isLoading || statsLoading || profileLoading) {
    return <LoadingState />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-3 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header compacto roxo com informações do usuário */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-4 text-white shadow-lg">
          {/* Topo do header com avatar, nome e ícones */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt={`Avatar de ${user?.username || 'Usuário'}`} className="w-full h-full object-cover rounded-full" /> : <span className="text-lg font-bold">👤</span>}
              </div>
              <div>
                <h2 className="text-lg font-bold">{user?.username || 'Usuário'}</h2>
                <div className="flex items-center space-x-2">
                  <p className="text-purple-200 text-xs">Nv. {currentLevel.level}</p>
                  <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                    {currentLevel.title}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm">
                🔔
              </button>
              <button onClick={handleNavigateToSettings} className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors text-sm">
                ⚙️
              </button>
            </div>
          </div>
          
          {/* Cards de estatísticas compactos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-yellow-400 text-sm">🪙</span>
                <span className="text-xs text-purple-200">Pontos Totais</span>
              </div>
              <p className="text-xl font-bold">{(stats?.totalScore || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-yellow-400 text-sm">🏆</span>
                <span className="text-xs text-purple-200">Ranking Global</span>
              </div>
              <p className="text-xl font-bold">
                {stats?.position ? `#${stats.position}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Card de Ranking Global compacto */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              #{stats?.position || 'N/A'}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-slate-600">Posição atual</p>
                  <p className="text-lg font-bold text-slate-800">
                    {stats?.position ? `${stats.position}º lugar mundial` : 'Posição não disponível'}
                  </p>
                </div>
                
                {/* Informação de Premiação inline */}
                {stats?.position && !prizesLoading && (
                  <div className="text-right">
                    {(() => {
                      const position = stats.position;
                      const prizeInfo = calculatePrizeForPosition(position);
                      return <div className={`px-2 py-1 rounded-lg text-xs font-medium ${prizeInfo.amount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {prizeInfo.amount > 0 ? `🎁 ${prizeInfo.text}` : '💰 Sem premiação'}
                      </div>;
                    })()}
                  </div>
                )}
              </div>
              
              {/* Barra de progresso compacta */}
              <div>
                <div className="bg-slate-200 rounded-full h-2 mb-1">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full h-2 transition-all duration-500" style={{
                    width: '65%'
                  }} />
                </div>
                <p className="text-xs text-slate-500">
                  {stats?.position && stats.position > 1 ? `${Math.max(100, Math.ceil((stats.totalScore || 0) * 0.1)).toLocaleString()} pts para subir no ranking` : 'Você está no topo!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && <ErrorState error={error} onRetry={refetch} />}

        <CompetitionsList competitions={competitions} onStartChallenge={onStartChallenge} onRefresh={refetch} />
      </div>
    </div>;
};
export default HomeScreen;