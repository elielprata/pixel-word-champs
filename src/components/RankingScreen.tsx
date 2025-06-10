
import React, { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Award, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

      // Processar dados semanais
      const uniquePlayerIds = new Set();
      const weeklyPlayers: RankingPlayer[] = (weeklyData || [])
        .filter(item => {
          if (uniquePlayerIds.has(item.user_id)) {
            return false;
          }
          uniquePlayerIds.add(item.user_id);
          return true;
        })
        .map(item => ({
          position: item.position,
          user_id: item.user_id,
          username: item.profiles?.username || 'Usuário',
          avatar_url: item.profiles?.avatar_url,
          score: item.score,
          prize: item.prize || 0
        }));

      setWeeklyRanking(weeklyPlayers);
      setWeeklyCompetition(competition);

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
    
    switch (position) {
      case 1: return prizePool * 0.50;
      case 2: return prizePool * 0.30;
      case 3: return prizePool * 0.20;
      default: return 0;
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return (
        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
          {position}
        </div>
      );
    }
  };

  const formatTimeRemaining = () => {
    if (!weeklyCompetition) return '';
    
    const now = new Date();
    const endDate = new Date(weeklyCompetition.end_date);
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizada';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl mx-auto flex items-center justify-center animate-pulse">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-slate-200 rounded-lg w-48 mx-auto animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-32 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-4 pb-24 max-w-lg mx-auto">
        {/* Header Compacto */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            🏆 Ranking Semanal
          </h1>
          
          {weeklyCompetition && (
            <div className="bg-white rounded-xl p-3 shadow-sm border">
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">
                    R$ {weeklyCompetition.prize_pool.toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-500">Prêmio</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {formatTimeRemaining()}
                  </div>
                  <div className="text-xs text-slate-500">Restante</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Distribuição de Prêmios */}
        {weeklyCompetition && (
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-2">
              {[
                { pos: '1º', icon: Crown, amount: weeklyCompetition.prize_pool * 0.50, color: 'bg-yellow-50 border-yellow-200' },
                { pos: '2º', icon: Medal, amount: weeklyCompetition.prize_pool * 0.30, color: 'bg-slate-50 border-slate-200' },
                { pos: '3º', icon: Award, amount: weeklyCompetition.prize_pool * 0.20, color: 'bg-orange-50 border-orange-200' }
              ].map((prize, index) => (
                <div key={index} className={`${prize.color} rounded-lg p-2 border text-center`}>
                  <prize.icon className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                  <div className="text-sm font-bold text-slate-800">
                    R$ {prize.amount.toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-600">
                    {prize.pos}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posição do Usuário */}
        {userWeeklyPosition && user && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPositionIcon(userWeeklyPosition)}
                  <div>
                    <div className="font-bold text-slate-800">#{userWeeklyPosition}</div>
                    <div className="text-sm text-slate-600">Sua posição</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">
                    {weeklyRanking.find(p => p.user_id === user.id)?.score.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-slate-600">pontos</div>
                  {getPrizeAmount(userWeeklyPosition) > 0 && (
                    <div className="text-xs text-emerald-600 font-semibold">
                      R$ {getPrizeAmount(userWeeklyPosition).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-3 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-red-400" />
              <p className="text-red-600 text-sm mb-2">{error}</p>
              <Button onClick={loadWeeklyRankingData} variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-100">
                🔄 Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Lista do Ranking */}
        <Card className="shadow-sm border">
          <CardContent className="p-0">
            {weeklyRanking.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-medium">Nenhum jogador no ranking</p>
                <p className="text-sm">Seja o primeiro a pontuar!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {weeklyRanking.slice(0, 50).map((player, index) => {
                  const isCurrentUser = user?.id === player.user_id;
                  const prizeAmount = getPrizeAmount(player.position);
                  
                  return (
                    <div 
                      key={`${player.user_id}-${index}`}
                      className={`flex items-center justify-between p-3 ${
                        isCurrentUser ? 'bg-blue-50 border-l-2 border-blue-500' : 
                        player.position <= 3 ? 'bg-gradient-to-r from-slate-50 to-white' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getPositionIcon(player.position)}
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {player.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {isCurrentUser ? 'Você' : player.username}
                          </p>
                          <p className="text-sm text-slate-500">
                            {player.score.toLocaleString()} pts
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-slate-800">
                          #{player.position}
                        </div>
                        {prizeAmount > 0 && (
                          <div className="text-sm text-emerald-600 font-semibold">
                            R$ {prizeAmount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RankingScreen;
