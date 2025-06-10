import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import RankingHeader from './ranking/RankingHeader';
import PrizeDistribution from './ranking/PrizeDistribution';
import UserPositionCard from './ranking/UserPositionCard';
import RankingList from './ranking/RankingList';

interface RankingPlayer {
  position: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  score: number;
  prize?: number;
}

interface WeeklyCompetition {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
}

const RankingScreen = () => {
  const { user } = useAuth();
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [weeklyCompetition, setWeeklyCompetition] = useState<WeeklyCompetition | null>(null);
  const [userWeeklyPosition, setUserWeeklyPosition] = useState<number | null>(null);
  const [totalWeeklyPlayers, setTotalWeeklyPlayers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyRankingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 Carregando dados do ranking semanal...');
      
      // Calcular início da semana (segunda-feira)
      const todayDate = new Date();
      const dayOfWeek = todayDate.getDay();
      const diff = todayDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(todayDate.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Buscar ranking semanal
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('weekly_rankings')
        .select(`
          position,
          user_id,
          score,
          prize,
          profiles!inner(username, avatar_url)
        `)
        .eq('week_start', weekStartStr)
        .order('position', { ascending: true })
        .limit(50);

      if (weeklyError) {
        console.error('❌ Erro ao buscar ranking semanal:', weeklyError);
        throw weeklyError;
      }

      // Buscar competição semanal ativa
      const { data: competition, error: competitionError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'tournament')
        .eq('status', 'active')
        .single();

      if (competitionError && competitionError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar competição semanal:', competitionError);
      }

      // Contar total de jogadores semanais
      const { count: weeklyCount } = await supabase
        .from('weekly_rankings')
        .select('*', { count: 'exact', head: true })
        .eq('week_start', weekStartStr);

      // Processar dados semanais
      const weeklyPlayers: RankingPlayer[] = (weeklyData || []).map(item => ({
        position: item.position,
        user_id: item.user_id,
        username: item.profiles?.username || 'Usuário',
        avatar_url: item.profiles?.avatar_url,
        score: item.score,
        prize: item.prize || 0
      }));

      setWeeklyRanking(weeklyPlayers);
      setWeeklyCompetition(competition);
      setTotalWeeklyPlayers(weeklyCount || 0);

      // Encontrar posição do usuário atual
      if (user?.id) {
        const userWeekly = weeklyPlayers.find(p => p.user_id === user.id);
        setUserWeeklyPosition(userWeekly?.position || null);
      }

      console.log('✅ Ranking semanal carregado:', {
        weekly: weeklyPlayers.length,
        competition: !!competition
      });

    } catch (err) {
      console.error('❌ Erro ao carregar ranking semanal:', err);
      setError('Erro ao carregar ranking semanal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeeklyRankingData();
  }, [user?.id]);

  const getPrizeAmount = (position: number) => {
    if (!weeklyCompetition) return 0;
    const prizePool = weeklyCompetition.prize_pool;
    
    // Nova distribuição para até 100 ganhadores
    if (position === 1) return prizePool * 0.25; // 25% para o 1º lugar
    if (position <= 3) return (prizePool * 0.20) / 2; // 20% dividido entre 2º e 3º
    if (position <= 10) return (prizePool * 0.25) / 7; // 25% dividido entre 4º-10º
    if (position <= 50) return (prizePool * 0.20) / 40; // 20% dividido entre 11º-50º
    if (position <= 100) return (prizePool * 0.10) / 50; // 10% dividido entre 51º-100º
    
    return 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center animate-pulse">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-32 mx-auto animate-pulse"></div>
            <div className="h-3 bg-slate-200 rounded w-24 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="p-6 pb-24 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <RankingHeader 
          weeklyCompetition={weeklyCompetition}
          totalWeeklyPlayers={totalWeeklyPlayers}
        />

        {/* Prize Distribution */}
        <PrizeDistribution weeklyCompetition={weeklyCompetition} />

        {/* User Position */}
        <UserPositionCard 
          userWeeklyPosition={userWeeklyPosition}
          weeklyRanking={weeklyRanking}
          user={user}
          getPrizeAmount={getPrizeAmount}
        />

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-red-400" />
              <p className="text-red-600 font-medium mb-2">{error}</p>
              <Button onClick={loadWeeklyRankingData} variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-100">
                🔄 Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ranking List */}
        <RankingList 
          weeklyRanking={weeklyRanking}
          user={user}
          totalWeeklyPlayers={totalWeeklyPlayers}
          weeklyCompetition={weeklyCompetition}
          getPrizeAmount={getPrizeAmount}
        />
      </div>
    </div>
  );
};

export default RankingScreen;
