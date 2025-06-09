
import React, { useEffect, useState } from 'react';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
import { useAuth } from '@/hooks/useAuth';
import { TIMING_CONFIG } from '@/constants/app';
import HomeHeader from './home/HomeHeader';
import UserStatsCard from './home/UserStatsCard';
import CompetitionsList from './home/CompetitionsList';
import LoadingState from './home/LoadingState';
import ErrorState from './home/ErrorState';

interface Competition {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
}

interface HomeScreenProps {
  onStartChallenge: (challengeId: number) => void;
  onViewFullRanking: () => void;
  onViewChallengeRanking: (challengeId: number) => void;
}

const HomeScreen = ({ onStartChallenge, onViewFullRanking }: HomeScreenProps) => {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompetitions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎯 Carregando competições diárias ativas...');

      const response = await dailyCompetitionService.getActiveDailyCompetitions();
      
      if (response.success) {
        console.log(`✅ ${response.data.length} competições diárias encontradas`);
        setCompetitions(response.data);
      } else {
        console.error('❌ Erro ao buscar competições:', response.error);
        setError(response.error || 'Erro ao carregar competições');
      }

    } catch (err) {
      console.error('❌ Erro ao carregar competições:', err);
      setError('Erro ao carregar competições');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitions();
    
    const interval = setInterval(loadCompetitions, TIMING_CONFIG.COMPETITION_REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern - Word Search Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100"></div>
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, #e2e8f0 1px, transparent 1px),
              linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        ></div>
        {/* Scattered Letters Background */}
        <div className="absolute inset-0 text-slate-300 text-xs font-mono opacity-30 pointer-events-none select-none">
          <div className="absolute top-10 left-10">A</div>
          <div className="absolute top-20 right-20">B</div>
          <div className="absolute top-32 left-1/4">C</div>
          <div className="absolute top-44 right-1/3">D</div>
          <div className="absolute bottom-32 left-16">E</div>
          <div className="absolute bottom-20 right-12">F</div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 pb-20">
        {/* Game Board Style Container */}
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Header in Game Board Style */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-blue-200 shadow-lg p-1">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <HomeHeader />
            </div>
          </div>

          {/* Stats Card as Game Panel */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200 shadow-lg p-1">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
              <UserStatsCard />
            </div>
          </div>

          {/* Error State if needed */}
          {error && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-red-200 shadow-lg p-1">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                <ErrorState error={error} onRetry={loadCompetitions} />
              </div>
            </div>
          )}

          {/* Competitions List as Game Challenges */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-indigo-200 shadow-lg p-1">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
              <CompetitionsList
                competitions={competitions}
                onStartChallenge={onStartChallenge}
                onRefresh={loadCompetitions}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-1/4 right-4 w-8 h-8 bg-blue-200/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
      <div className="absolute top-1/3 left-4 w-6 h-6 bg-purple-200/30 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
      <div className="absolute bottom-1/3 right-8 w-4 h-4 bg-indigo-200/30 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
    </div>
  );
};

export default HomeScreen;
