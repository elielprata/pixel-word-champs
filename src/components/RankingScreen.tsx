
import React, { useState, useEffect } from 'react';
import { Trophy, Star } from 'lucide-react';
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

  const renderRankingList = (players: RankingPlayer[], userPosition: number | null, totalPlayers: number, showPrize = false) => {
    if (players.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Nenhum jogador no ranking ainda</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* User's position (if not in top 50) */}
        {userPosition && userPosition > 50 && user && (
          <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-full text-sm font-bold">
                {userPosition}
              </div>
              <div className="flex-1">
                <span className="font-medium text-purple-900">Você</span>
                <div className="text-sm text-purple-700">
                  Sua posição atual
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-purple-600">
                  {players.find(p => p.user_id === user.id)?.score || 0}
                </div>
                <div className="text-xs text-purple-500">pts</div>
              </div>
            </div>
          </div>
        )}

        {/* Top players */}
        {players.map((player) => {
          const isCurrentUser = user?.id === player.user_id;
          const isTopThree = player.position <= 3;
          
          return (
            <div 
              key={player.user_id} 
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                isCurrentUser 
                  ? 'bg-purple-50 border-2 border-purple-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-white shadow-sm ${
                player.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                player.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                player.position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                isCurrentUser ? 'bg-purple-600' : 'bg-gray-400'
              }`}>
                {player.position}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${isCurrentUser ? 'text-purple-900' : 'text-gray-900'}`}>
                    {isCurrentUser ? 'Você' : player.username}
                  </span>
                  {isTopThree && (
                    <Badge variant="outline" className="text-xs">
                      Top {player.position}
                    </Badge>
                  )}
                </div>
                {showPrize && player.prize && player.prize > 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    Prêmio: R$ {player.prize.toFixed(2)}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className={`font-bold ${isCurrentUser ? 'text-purple-600' : 'text-gray-700'}`}>
                  {player.score.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">pts</div>
              </div>
            </div>
          );
        })}
        
        {/* Total players info */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Total de {totalPlayers} jogadores{userPosition && ` • Você está em #${userPosition}`}
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="p-6 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ranking Semanal</h1>
          <p className="text-gray-600">Veja como você está se saindo</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-red-200 mb-6">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-red-400" />
            <p className="text-red-600 font-medium mb-2">Erro ao carregar ranking</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Button onClick={loadWeeklyRankingData} variant="outline" size="sm">
              🔄 Tentar novamente
            </Button>
          </div>
        )}

        {/* Weekly Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-600" />
              Ranking Semanal
            </CardTitle>
            <p className="text-sm text-gray-600">
              Classificação da semana atual com prêmios
            </p>
            {weeklyCompetition && (
              <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-900">{weeklyCompetition.title}</span>
                </div>
                <div className="text-sm text-purple-700">
                  Prêmio total: R$ {weeklyCompetition.prize_pool.toFixed(2)}
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {renderRankingList(weeklyRanking, userWeeklyPosition, totalWeeklyPlayers, true)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RankingScreen;
