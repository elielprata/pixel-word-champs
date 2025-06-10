
import React, { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Award, Crown, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      
      console.log('📊 Carregando ranking...');
      
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

      console.log('✅ Ranking carregado:', players.length, 'jogadores');

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
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return (
        <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-semibold text-gray-700">Carregando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-800 mb-2 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8" />
            Ranking Geral
          </h1>
          <p className="text-purple-600">Classificação por pontuação total</p>
        </div>

        {/* Stats Card */}
        <Card className="mb-6 bg-white/70 backdrop-blur-sm border-purple-200 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold text-green-600">R$ 185</span>
                </div>
                <p className="text-sm text-gray-600">Prêmio Semanal</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold text-blue-600">{ranking.length}</span>
                </div>
                <p className="text-sm text-gray-600">Jogadores Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Position Card */}
        {userPosition && user && (
          <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    {getPositionIcon(userPosition)}
                  </div>
                  <div>
                    <p className="font-bold text-lg">#{userPosition}</p>
                    <p className="text-purple-100">Sua Posição</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {ranking.find(p => p.user_id === user.id)?.score.toLocaleString() || 0}
                  </p>
                  <p className="text-purple-100">pontos</p>
                  {getPrizeAmount(userPosition) > 0 && (
                    <div className="text-sm font-semibold text-green-300 bg-green-600/30 rounded px-2 py-1 mt-1">
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
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-red-400" />
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={loadRanking} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                🔄 Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ranking List */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-purple-800 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Classificação
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {ranking.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Trophy className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="font-semibold text-xl mb-2">Arena Vazia!</p>
                <p>Seja o primeiro campeão!</p>
              </div>
            ) : (
              <div className="divide-y divide-purple-100">
                {ranking.map((player) => {
                  const isCurrentUser = user?.id === player.user_id;
                  const prizeAmount = getPrizeAmount(player.pos);
                  
                  return (
                    <div 
                      key={player.user_id}
                      className={`flex items-center justify-between p-4 transition-all hover:bg-purple-50 ${
                        isCurrentUser ? 'bg-purple-100 border-l-4 border-purple-500' : ''
                      } ${player.pos <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12">
                          {getPositionIcon(player.pos)}
                        </div>
                        
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {player.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-2">
                            <span>{isCurrentUser ? 'Você' : player.name}</span>
                            {player.pos === 1 && <span>👑</span>}
                            {player.pos === 2 && <span>🥈</span>}
                            {player.pos === 3 && <span>🥉</span>}
                          </p>
                          <p className="text-sm text-gray-500">
                            {player.score.toLocaleString()} pontos
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-lg text-purple-700">
                          #{player.pos}
                        </div>
                        {prizeAmount > 0 && (
                          <div className="text-sm text-green-600 font-semibold bg-green-100 rounded-full px-3 py-1 mt-1">
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
