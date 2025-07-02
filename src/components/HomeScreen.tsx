
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { useProfile } from '@/hooks/useProfile';
import { useWeeklyCompetitionAutoParticipation } from '@/hooks/useWeeklyCompetitionAutoParticipation';
import { useWeeklyRankingUpdater } from '@/hooks/useWeeklyRankingUpdater';
import { useOptimizedCompetitions } from '@/hooks/useOptimizedCompetitions';
import { useAppNavigation } from '@/hooks/useAppNavigation';
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

const HomeScreen = ({ onStartChallenge, onViewFullRanking }: HomeScreenProps) => {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { profile, isLoading: profileLoading } = useProfile();
  const { setActiveTab } = useAppNavigation();
  
  // Usar o hook otimizado que já inclui competições ativas e agendadas
  const { competitions, isLoading, error, refetch } = useOptimizedCompetitions();

  // Manter participação automática e atualização de ranking semanal
  useWeeklyCompetitionAutoParticipation();
  useWeeklyRankingUpdater();

  // Calcular nível baseado nos experience_points ou total_score
  const getUserLevel = (experiencePoints: number, totalScore: number) => {
    if (experiencePoints > 0) {
      return Math.max(1, Math.floor(experiencePoints / 100) + 1);
    }
    return Math.max(1, Math.floor(totalScore / 1000) + 1);
  };

  // Determinar título do nível baseado nos dados reais
  const getLevelTitle = (level: number, experiencePoints: number) => {
    // Se tem experience_points, usar sistema mais refinado
    if (experiencePoints > 0) {
      if (experiencePoints >= 1000) return 'LENDA';
      if (experiencePoints >= 500) return 'MESTRE';
      if (experiencePoints >= 300) return 'EXPERT';
      if (experiencePoints >= 150) return 'AVANÇADO';
      if (experiencePoints >= 50) return 'INTERMEDIÁRIO';
      return 'INICIANTE';
    }
    
    // Fallback para sistema baseado em nível
    if (level >= 50) return 'LENDA';
    if (level >= 25) return 'MESTRE';
    if (level >= 15) return 'EXPERT';
    if (level >= 10) return 'AVANÇADO';
    if (level >= 5) return 'INTERMEDIÁRIO';
    return 'INICIANTE';
  };

  const userLevel = getUserLevel(profile?.experience_points || 0, stats?.totalScore || 0);
  const levelTitle = getLevelTitle(userLevel, profile?.experience_points || 0);

  logger.info('🏠 HomeScreen renderizado', { 
    userId: user?.id,
    competitionsCount: competitions.length,
    timestamp: new Date().toISOString()
  }, 'HOME_SCREEN');

  if (isLoading || statsLoading || profileLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-3 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header roxo com informações do usuário */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
          {/* Topo do header com avatar, nome e ícones */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={`Avatar de ${user?.username || 'Usuário'}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-xl font-bold">👤</span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.username || 'Usuário'}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-purple-200 text-sm">Nv. {userLevel}</p>
                  <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                    {levelTitle}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                🔔
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                ⚙️
              </button>
            </div>
          </div>
          
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-yellow-400">🪙</span>
                <span className="text-sm text-purple-200">Pontos Totais</span>
              </div>
              <p className="text-2xl font-bold">{(stats?.totalScore || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-yellow-400">🏆</span>
                <span className="text-sm text-purple-200">Ranking Global</span>
              </div>
              <p className="text-2xl font-bold">
                {stats?.position ? `#${stats.position}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <ErrorState error={error} onRetry={refetch} />
        )}

        <CompetitionsList
          competitions={competitions}
          onStartChallenge={onStartChallenge}
          onRefresh={refetch}
        />
      </div>
    </div>
  );
};

export default HomeScreen;
