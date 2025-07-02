
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { useProfile } from '@/hooks/useProfile';
import { usePlayerLevel } from '@/hooks/usePlayerLevel';
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

  // Usar sistema real de níveis e títulos baseado nos experience_points
  const totalXP = profile?.experience_points || 0;
  const { currentLevel, progress } = usePlayerLevel(totalXP);

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
                  <p className="text-purple-200 text-sm">Nv. {currentLevel.level}</p>
                  <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                    {currentLevel.title}
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

        {/* Card de Ranking Global */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Ranking Global</h3>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              🏆
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              #{stats?.position || 'N/A'}
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-1">Posição atual</p>
              <p className="text-xl font-bold text-slate-800">
                {stats?.position ? `${stats.position}º lugar mundial` : 'Posição não disponível'}
              </p>
              
              {/* Barra de progresso simulada */}
              <div className="mt-3">
                <div className="bg-slate-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full h-3 transition-all duration-500"
                    style={{ width: '65%' }}
                  />
                </div>
                <p className="text-sm text-slate-500">
                  {stats?.totalScore ? `${stats.totalScore.toLocaleString()} pts` : '0 pts'} para o próximo nível
                </p>
              </div>
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
