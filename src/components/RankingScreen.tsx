import React, { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Award, Crown, Zap, Flame, Sparkles, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import RankingDebugPanel from './RankingDebugPanel';

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
  const [showDebug, setShowDebug] = useState(false);

  const loadWeeklyRankingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 Carregando ranking semanal em tempo real...');
      
      // Primeiro, atualizar o ranking semanal para garantir dados atualizados
      console.log('🔄 Forçando atualização do ranking antes de carregar...');
      await supabase.rpc('update_weekly_ranking');
      
      const todayDate = new Date();
      const dayOfWeek = todayDate.getDay();
      const diff = todayDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(todayDate.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Buscar ranking atualizado com logs detalhados
      console.log(`📅 Buscando ranking para semana iniciada em: ${weekStartStr}`);
      
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

      console.log('📊 Dados brutos do ranking:', weeklyData);

      // Buscar competição ativa
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
            console.warn(`⚠️ Usuário duplicado detectado: ${item.user_id}`);
            return false;
          }
          uniquePlayerIds.add(item.user_id);
          return true;
        })
        .map(item => {
          console.log(`👤 Mapeando usuário: ${item.profiles?.username} - Posição: ${item.position} - Score: ${item.score}`);
          return {
            position: item.position,
            user_id: item.user_id,
            username: item.profiles?.username || 'Usuário',
            avatar_url: item.profiles?.avatar_url,
            score: item.score,
            prize: item.prize || 0
          };
        });

      setWeeklyRanking(weeklyPlayers);
      setWeeklyCompetition(competition);

      if (user?.id) {
        const userWeekly = weeklyPlayers.find(p => p.user_id === user.id);
        setUserWeeklyPosition(userWeekly?.position || null);
        
        if (userWeekly) {
          console.log(`🏆 Posição do usuário atual: #${userWeekly.position} com ${userWeekly.score} pontos`);
        } else {
          console.log('ℹ️ Usuário atual não encontrado no ranking');
        }
      }

      console.log('✅ Ranking semanal carregado em tempo real:', {
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

  // Configurar atualizações em tempo real
  useEffect(() => {
    console.log('🔄 Configurando monitoramento em tempo real para rankings...');

    // Monitorar mudanças na tabela profiles (pontuação total)
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('📡 Mudança detectada nos perfis:', payload);
          // Recarregar ranking quando pontuação mudar
          loadWeeklyRankingData();
        }
      )
      .subscribe();

    // Monitorar mudanças na tabela weekly_rankings
    const rankingsChannel = supabase
      .channel('weekly-rankings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_rankings'
        },
        (payload) => {
          console.log('📡 Mudança detectada no ranking semanal:', payload);
          loadWeeklyRankingData();
        }
      )
      .subscribe();

    // Monitorar mudanças nas competições
    const competitionsChannel = supabase
      .channel('competitions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_competitions'
        },
        (payload) => {
          console.log('📡 Mudança detectada nas competições:', payload);
          loadWeeklyRankingData();
        }
      )
      .subscribe();

    // Atualizar periodicamente para garantir sincronização
    const interval = setInterval(() => {
      console.log('🔄 Atualização periódica do ranking...');
      loadWeeklyRankingData();
    }, 30000); // A cada 30 segundos

    return () => {
      console.log('🔌 Desconectando canais de tempo real');
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(rankingsChannel);
      supabase.removeChannel(competitionsChannel);
      clearInterval(interval);
    };
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
      case 1: return <Crown className="w-5 h-5 text-yellow-600" />;
      case 2: return <Medal className="w-5 h-5 text-gray-500" />;
      case 3: return <Award className="w-5 h-5 text-orange-600" />;
      default: return (
        <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold text-white">
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

  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('lovable');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative z-10 p-4 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              🏆 Ranking Semanal
            </h1>
            {isDevelopment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
                className="text-yellow-600 hover:text-yellow-700"
              >
                <Bug className="w-4 h-4 mr-1" />
                Debug
              </Button>
            )}
          </div>
          <p className="text-gray-600 text-sm">Competição dos Campeões</p>
          
          {weeklyCompetition && (
            <Card className="mt-4 bg-white border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-xl font-bold text-green-600">
                        R$ {weeklyCompetition.prize_pool.toFixed(0)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Prêmio Total</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-xl font-bold text-blue-600">
                        {formatTimeRemaining()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Tempo Restante</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Debug Panel */}
        {showDebug && isDevelopment && <RankingDebugPanel />}

        {/* Prize Distribution */}
        {weeklyCompetition && (
          <div className="mb-6">
            <div className="text-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                💰 Distribuição dos Prêmios
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { pos: '🥇', amount: weeklyCompetition.prize_pool * 0.50, color: 'bg-yellow-500' },
                { pos: '🥈', amount: weeklyCompetition.prize_pool * 0.30, color: 'bg-gray-400' },
                { pos: '🥉', amount: weeklyCompetition.prize_pool * 0.20, color: 'bg-orange-500' }
              ].map((prize, index) => (
                <Card key={index} className={`${prize.color} border-0 shadow-sm`}>
                  <CardContent className="p-3 text-center text-white">
                    <div className="text-xl mb-1">{prize.pos}</div>
                    <div className="text-sm font-semibold">
                      R$ {prize.amount.toFixed(0)}
                    </div>
                    <div className="text-xs opacity-90">
                      {index === 0 ? '50%' : index === 1 ? '30%' : '20%'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* User Position */}
        {userWeeklyPosition && user && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {getPositionIcon(userWeeklyPosition)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">#{userWeeklyPosition}</div>
                    <div className="text-sm text-gray-600">Sua Posição</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {weeklyRanking.find(p => p.user_id === user.id)?.score.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">pontos</div>
                  {getPrizeAmount(userWeeklyPosition) > 0 && (
                    <div className="text-sm font-semibold text-green-600 bg-green-100 rounded px-2 py-1 mt-1">
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
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <Button onClick={loadWeeklyRankingData} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                🔄 Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ranking List */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-0">
            {weeklyRanking.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="font-semibold text-lg mb-2">Arena Vazia!</p>
                <p className="text-sm">Seja o primeiro campeão!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {weeklyRanking.slice(0, 50).map((player, index) => {
                  const isCurrentUser = user?.id === player.user_id;
                  const prizeAmount = getPrizeAmount(player.position);
                  
                  return (
                    <div 
                      key={`${player.user_id}-${index}`}
                      className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 ${
                        isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      } ${player.position <= 3 ? 'bg-yellow-50' : ''}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          {getPositionIcon(player.position)}
                        </div>
                        
                        <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center text-white font-semibold">
                          {player.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center space-x-2">
                            <span>{isCurrentUser ? 'Você' : player.username}</span>
                            {player.position === 1 && <span>👑</span>}
                            {player.position === 2 && <span>🥈</span>}
                            {player.position === 3 && <span>🥉</span>}
                            {isCurrentUser && (
                              <span className="text-xs text-blue-600 font-normal">(ID: {player.user_id.slice(0, 8)}...)</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {player.score.toLocaleString()} pts
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          #{player.position}
                        </div>
                        {prizeAmount > 0 && (
                          <div className="text-sm text-green-600 font-semibold bg-green-100 rounded px-2 py-1">
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
