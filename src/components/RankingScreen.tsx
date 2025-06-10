import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, Medal, Award, Coins, Timer, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    
    switch (position) {
      case 1: return prizePool * 0.50; // 50%
      case 2: return prizePool * 0.30; // 30%
      case 3: return prizePool * 0.20; // 20%
      default: return 0;
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: return (
        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
          {position}
        </div>
      );
    }
  };

  const getRankColors = (position: number) => {
    switch (position) {
      case 1: return "from-yellow-50 to-yellow-100 border-yellow-200 shadow-yellow-100";
      case 2: return "from-gray-50 to-gray-100 border-gray-200 shadow-gray-100";
      case 3: return "from-orange-50 to-orange-100 border-orange-200 shadow-orange-100";
      default: return "from-slate-50 to-white border-slate-200 shadow-slate-100";
    }
  };

  const formatTimeRemaining = () => {
    if (!weeklyCompetition) return '';
    
    const now = new Date();
    const endDate = new Date(weeklyCompetition.end_date);
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Competição finalizada';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h restantes`;
    if (hours > 0) return `${hours}h ${minutes}m restantes`;
    return `${minutes}m restantes`;
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
        {/* Header com Prêmio em Destaque */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl shadow-2xl">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Ranking Semanal</h1>
            <p className="text-lg text-gray-600">Competição em andamento</p>
          </div>
        </div>

        {/* Card de Prêmio Principal */}
        {weeklyCompetition && (
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 shadow-2xl text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-yellow-300" />
                    <span className="text-yellow-300 font-semibold">PRÊMIO TOTAL</span>
                  </div>
                  <div className="text-4xl font-bold">
                    R$ {weeklyCompetition.prize_pool.toFixed(2)}
                  </div>
                  <p className="text-blue-100">{weeklyCompetition.title}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2 text-blue-100">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm">{formatTimeRemaining()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{totalWeeklyPlayers} participantes</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Distribuição de Prêmios */}
            <CardContent className="relative z-10 pt-0">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Crown className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
                  <div className="text-lg font-bold">R$ {(weeklyCompetition.prize_pool * 0.50).toFixed(2)}</div>
                  <div className="text-xs text-blue-100">1º Lugar</div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Medal className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                  <div className="text-lg font-bold">R$ {(weeklyCompetition.prize_pool * 0.30).toFixed(2)}</div>
                  <div className="text-xs text-blue-100">2º Lugar</div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Award className="w-6 h-6 text-orange-300 mx-auto mb-1" />
                  <div className="text-lg font-bold">R$ {(weeklyCompetition.prize_pool * 0.20).toFixed(2)}</div>
                  <div className="text-xs text-blue-100">3º Lugar</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posição do Usuário */}
        {userWeeklyPosition && user && (
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 shadow-xl text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full">
                    <span className="text-xl font-bold">#{userWeeklyPosition}</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Sua Posição Atual</p>
                    <p className="text-indigo-100">Continue jogando para subir no ranking!</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {weeklyRanking.find(p => p.user_id === user.id)?.score || 0}
                  </div>
                  <p className="text-indigo-100">pontos</p>
                  {getPrizeAmount(userWeeklyPosition) > 0 && (
                    <div className="text-yellow-300 font-semibold mt-1">
                      Prêmio: R$ {getPrizeAmount(userWeeklyPosition).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Star className="w-6 h-6 text-purple-600" />
              Classificação Atual
            </CardTitle>
            <p className="text-gray-600">Top jogadores da semana</p>
          </CardHeader>
          <CardContent className="p-0">
            {weeklyRanking.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Nenhum jogador no ranking ainda</p>
                <p className="text-sm">Seja o primeiro a pontuar esta semana!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {weeklyRanking.slice(0, 50).map((player) => {
                  const isCurrentUser = user?.id === player.user_id;
                  const prizeAmount = getPrizeAmount(player.position);
                  
                  return (
                    <div 
                      key={player.user_id} 
                      className={`
                        flex items-center gap-4 p-4 transition-all hover:shadow-md
                        ${isCurrentUser ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500' : 'hover:bg-gray-50'}
                        ${player.position <= 3 ? `bg-gradient-to-r ${getRankColors(player.position)} border-l-4 shadow-lg` : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12">
                          {getRankIcon(player.position)}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {player.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className={`font-semibold ${isCurrentUser ? 'text-purple-900' : 'text-gray-900'}`}>
                              {isCurrentUser ? 'Você' : player.username}
                              {player.position <= 3 && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Top {player.position}
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">#{player.position}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1"></div>
                      
                      <div className="text-right space-y-1">
                        <div className={`text-xl font-bold ${isCurrentUser ? 'text-purple-600' : 'text-gray-700'}`}>
                          {player.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">pontos</div>
                        {prizeAmount > 0 && (
                          <div className="text-sm font-semibold text-green-600 flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            R$ {prizeAmount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer com estatísticas */}
            {weeklyRanking.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-t">
                <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{totalWeeklyPlayers} participantes</span>
                  </div>
                  {userWeeklyPosition && (
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      <span>Você está em #{userWeeklyPosition}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    <span>R$ {weeklyCompetition?.prize_pool.toFixed(2)} em prêmios</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RankingScreen;
