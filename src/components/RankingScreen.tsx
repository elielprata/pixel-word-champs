
import React, { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Award, Crown, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RankingPlayer {
  pos: number;
  user_id: string;
  name: string;
  score: number;
}

const RankingScreen = () => {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingPlayer[]>([]);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRanking = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 Carregando ranking simplificado...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, total_score')
        .gt('total_score', 0)
        .order('total_score', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Erro ao carregar ranking:', error);
        throw error;
      }

      const players: RankingPlayer[] = (data || []).map((profile, index) => ({
        pos: index + 1,
        user_id: profile.id,
        name: profile.username || 'Usuário',
        score: profile.total_score || 0
      }));

      setRanking(players);

      // Encontrar posição do usuário atual
      if (user?.id) {
        const userRank = players.find(p => p.user_id === user.id);
        setUserPosition(userRank?.pos || null);
        
        if (userRank) {
          console.log(`🏆 Posição do usuário: #${userRank.pos} com ${userRank.score} pontos`);
        }
      }

      console.log('✅ Ranking simplificado carregado:', players.length, 'jogadores');

    } catch (err) {
      console.error('❌ Erro ao carregar ranking:', err);
      setError('Erro ao carregar ranking');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, [user?.id]);

  // Configurar atualizações em tempo real
  useEffect(() => {
    console.log('🔄 Configurando monitoramento em tempo real...');

    const profilesChannel = supabase
      .channel('profiles-ranking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('📡 Mudança detectada nos perfis:', payload);
          loadRanking();
        }
      )
      .subscribe();

    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Atualização periódica do ranking...');
      loadRanking();
    }, 30000);

    return () => {
      console.log('🔌 Desconectando canais de tempo real');
      supabase.removeChannel(profilesChannel);
      clearInterval(interval);
    };
  }, [user?.id]);

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

  const getPrizeAmount = (position: number) => {
    switch (position) {
      case 1: return 100;
      case 2: return 50;
      case 3: return 25;
      default: return position <= 10 ? 10 : 0;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full mx-auto flex items-center justify-center animate-bounce shadow-2xl">
            <Trophy className="w-12 h-12 text-white" />
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
    <div className="min-h-screen bg-gray-50">
      <div className="relative z-10 p-4 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🏆 Ranking Geral
          </h1>
          <p className="text-gray-600 text-sm">Classificação por Pontuação Total</p>
          
          <Card className="mt-4 bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span className="text-xl font-bold text-green-600">
                      R$ 185
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Prêmio Semanal</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="text-xl font-bold text-blue-600">
                      {ranking.length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Jogadores Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Position */}
        {userPosition && user && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {getPositionIcon(userPosition)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">#{userPosition}</div>
                    <div className="text-sm text-gray-600">Sua Posição</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {ranking.find(p => p.user_id === user.id)?.score.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">pontos</div>
                  {getPrizeAmount(userPosition) > 0 && (
                    <div className="text-sm font-semibold text-green-600 bg-green-100 rounded px-2 py-1 mt-1">
                      R$ {getPrizeAmount(userPosition).toFixed(2)}
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
              <Button onClick={loadRanking} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                🔄 Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ranking List */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-0">
            {ranking.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="font-semibold text-lg mb-2">Arena Vazia!</p>
                <p className="text-sm">Seja o primeiro campeão!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {ranking.map((player) => {
                  const isCurrentUser = user?.id === player.user_id;
                  const prizeAmount = getPrizeAmount(player.pos);
                  
                  return (
                    <div 
                      key={player.user_id}
                      className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 ${
                        isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      } ${player.pos <= 3 ? 'bg-yellow-50' : ''}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          {getPositionIcon(player.pos)}
                        </div>
                        
                        <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center text-white font-semibold">
                          {player.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center space-x-2">
                            <span>{isCurrentUser ? 'Você' : player.name}</span>
                            {player.pos === 1 && <span>👑</span>}
                            {player.pos === 2 && <span>🥈</span>}
                            {player.pos === 3 && <span>🥉</span>}
                          </p>
                          <p className="text-sm text-gray-500">
                            {player.score.toLocaleString()} pts
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          #{player.pos}
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
