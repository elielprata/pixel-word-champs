import React, { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Award, Crown, Zap, Fire, Sparkles } from 'lucide-react';
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
      
      const todayDate = new Date();
      const dayOfWeek = todayDate.getDay();
      const diff = todayDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(todayDate.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

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

      const { data: competition, error: competitionError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'tournament')
        .eq('status', 'active')
        .single();

      if (competitionError && competitionError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar competição semanal:', competitionError);
      }

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
      case 1: return <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Award className="w-6 h-6 text-orange-400" />;
      default: return (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
          {position}
        </div>
      );
    }
  };

  const getPositionGradient = (position: number) => {
    switch (position) {
      case 1: return "from-yellow-400 via-yellow-500 to-orange-500";
      case 2: return "from-gray-300 via-gray-400 to-gray-500";
      case 3: return "from-orange-400 via-orange-500 to-red-500";
      default: return "from-blue-400 via-purple-500 to-pink-500";
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

  // Definir as URLs SVG como constantes para evitar problemas de escape
  const backgroundPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("${backgroundPattern}")` }}></div>
        <div className="text-center space-y-6 z-10">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full mx-auto flex items-center justify-center animate-bounce shadow-2xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-ping"></div>
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full w-64 mx-auto animate-pulse opacity-80"></div>
            <div className="h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full w-48 mx-auto animate-pulse opacity-60"></div>
          </div>
          <div className="flex justify-center space-x-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
            <Star className="w-6 h-6 text-pink-400 animate-pulse" />
            <Sparkles className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("${backgroundPattern}")` }}></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-16 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 p-4 pb-24 max-w-lg mx-auto">
        {/* Gamified Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              <Star className="w-4 h-4 text-yellow-400 animate-bounce" />
              <Sparkles className="w-4 h-4 text-pink-400 animate-bounce delay-100" />
              <Star className="w-4 h-4 text-blue-400 animate-bounce delay-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            <h1 className="text-3xl font-black mb-2 tracking-wide">
              🏆 RANKING ÉPICO
            </h1>
          </div>
          <p className="text-purple-200 text-sm font-medium">Batalha dos Campeões</p>
          
          {weeklyCompetition && (
            <Card className="mt-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Fire className="w-4 h-4 text-orange-400" />
                      <span className="text-2xl font-bold text-green-400">
                        R$ {weeklyCompetition.prize_pool.toFixed(0)}
                      </span>
                    </div>
                    <div className="text-xs text-purple-200">Prêmio Total</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-2xl font-bold text-blue-400">
                        {formatTimeRemaining()}
                      </span>
                    </div>
                    <div className="text-xs text-purple-200">Tempo Restante</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Prize Distribution - Gamified */}
        {weeklyCompetition && (
          <div className="mb-6">
            <div className="text-center mb-3">
              <h3 className="text-lg font-bold text-yellow-400 flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>💰 Distribuição dos Prêmios</span>
                <Sparkles className="w-5 h-5" />
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { pos: '🥇', icon: Crown, amount: weeklyCompetition.prize_pool * 0.50, gradient: 'from-yellow-400 to-orange-500' },
                { pos: '🥈', icon: Medal, amount: weeklyCompetition.prize_pool * 0.30, gradient: 'from-gray-300 to-gray-500' },
                { pos: '🥉', icon: Award, amount: weeklyCompetition.prize_pool * 0.20, gradient: 'from-orange-400 to-red-500' }
              ].map((prize, index) => (
                <Card key={index} className={`bg-gradient-to-br ${prize.gradient} border-0 shadow-lg transform hover:scale-105 transition-transform`}>
                  <CardContent className="p-3 text-center text-white">
                    <div className="text-2xl mb-1">{prize.pos}</div>
                    <div className="text-sm font-bold">
                      R$ {prize.amount.toFixed(0)}
                    </div>
                    <div className="text-xs opacity-80">
                      {index === 0 ? '50%' : index === 1 ? '30%' : '20%'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* User Position - Gamified */}
        {userWeeklyPosition && user && (
          <Card className={`mb-6 bg-gradient-to-r ${getPositionGradient(userWeeklyPosition)} border-0 shadow-xl relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {getPositionIcon(userWeeklyPosition)}
                    {userWeeklyPosition <= 3 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-black text-lg">#{userWeeklyPosition}</div>
                    <div className="text-sm opacity-90 font-medium">🎯 Sua Posição</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-xl">
                    {weeklyRanking.find(p => p.user_id === user.id)?.score.toLocaleString() || 0}
                  </div>
                  <div className="text-sm opacity-90">⚡ pontos</div>
                  {getPrizeAmount(userWeeklyPosition) > 0 && (
                    <div className="text-sm font-bold bg-white/20 rounded px-2 py-1 mt-1">
                      💰 R$ {getPrizeAmount(userWeeklyPosition).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State - Gamified */}
        {error && (
          <Card className="border-red-400/30 bg-gradient-to-r from-red-500/20 to-pink-500/20 mb-6 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-red-300 text-sm mb-3">{error}</p>
              <Button onClick={loadWeeklyRankingData} variant="outline" size="sm" className="border-red-400 text-red-300 hover:bg-red-500/20">
                🔄 Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ranking List - Ultra Gamified */}
        <Card className="bg-black/20 border-purple-400/30 backdrop-blur-md shadow-2xl">
          <CardContent className="p-0">
            {weeklyRanking.length === 0 ? (
              <div className="text-center py-12 text-purple-200">
                <Trophy className="w-16 h-16 text-purple-300 mx-auto mb-4 animate-bounce" />
                <p className="font-bold text-lg mb-2">🚀 Arena Vazia!</p>
                <p className="text-sm">Seja o primeiro campeão!</p>
              </div>
            ) : (
              <div className="divide-y divide-purple-400/20">
                {weeklyRanking.slice(0, 50).map((player, index) => {
                  const isCurrentUser = user?.id === player.user_id;
                  const prizeAmount = getPrizeAmount(player.position);
                  
                  return (
                    <div 
                      key={`${player.user_id}-${index}`}
                      className={`flex items-center justify-between p-4 relative overflow-hidden transition-all hover:bg-white/5 ${
                        isCurrentUser ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-l-4 border-purple-400' : ''
                      } ${player.position <= 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : ''}`}
                    >
                      {player.position <= 3 && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-xl"></div>
                      )}
                      
                      <div className="flex items-center space-x-4 relative z-10">
                        <div className="relative">
                          {getPositionIcon(player.position)}
                          {player.position === 1 && (
                            <div className="absolute -top-2 -right-2 text-xs">✨</div>
                          )}
                        </div>
                        
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg bg-gradient-to-br ${getPositionGradient(player.position)}`}>
                          {player.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        
                        <div>
                          <p className="font-bold text-white flex items-center space-x-2">
                            <span>{isCurrentUser ? '🎯 Você' : player.username}</span>
                            {player.position === 1 && <span className="text-yellow-400">👑</span>}
                            {player.position === 2 && <span className="text-gray-300">🥈</span>}
                            {player.position === 3 && <span className="text-orange-400">🥉</span>}
                          </p>
                          <p className="text-sm text-purple-200 flex items-center space-x-1">
                            <Fire className="w-3 h-3" />
                            <span>{player.score.toLocaleString()} pts</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right relative z-10">
                        <div className="font-bold text-white text-lg">
                          #{player.position}
                        </div>
                        {prizeAmount > 0 && (
                          <div className="text-sm text-green-400 font-bold bg-green-500/20 rounded px-2 py-1">
                            💰 R$ {prizeAmount.toFixed(2)}
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
