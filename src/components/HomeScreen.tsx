
import React, { useEffect, useState } from 'react';
import { Trophy, Calendar, Users, Clock, Target, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

interface UserStats {
  total_score: number;
  games_played: number;
  best_daily_position: number;
  best_weekly_position: number;
  position_today: number;
}

interface HomeScreenProps {
  onStartChallenge: (challengeId: number) => void;
  onViewFullRanking: () => void;
  onViewChallengeRanking: (challengeId: number) => void;
}

const HomeScreen = ({ onViewFullRanking, onStartChallenge }: HomeScreenProps) => {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 Carregando dados da HomeScreen...');

      // Buscar competições ativas
      const { data: competitionsData, error: competitionsError } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString());

      if (competitionsError) {
        console.error('❌ Erro ao buscar competições:', competitionsError);
        throw competitionsError;
      }

      console.log(`✅ ${competitionsData?.length || 0} competições encontradas`);
      setCompetitions(competitionsData || []);

      // Buscar estatísticas do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_score, games_played, best_daily_position, best_weekly_position')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      // Buscar posição atual do usuário no ranking diário
      const { data: dailyRanking, error: rankingError } = await supabase
        .from('daily_rankings')
        .select('position')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (rankingError && rankingError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar ranking diário:', rankingError);
      }

      const stats: UserStats = {
        total_score: profile?.total_score || 0,
        games_played: profile?.games_played || 0,
        best_daily_position: profile?.best_daily_position || 0,
        best_weekly_position: profile?.best_weekly_position || 0,
        position_today: dailyRanking?.position || 0
      };

      console.log('📊 Estatísticas carregadas:', stats);
      setUserStats(stats);

    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m restantes`;
    }
    return `${minutes}m restantes`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Letra Arena</h1>
          <p className="text-gray-600">Desafie sua mente, conquiste palavras</p>
        </div>

        {/* User Stats Card */}
        {userStats && (
          <Card className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-white">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">
                    {userStats.position_today ? `#${userStats.position_today}` : '-'}
                  </div>
                  <div className="text-sm opacity-90">Hoje</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">
                    {userStats.total_score.toLocaleString()}
                  </div>
                  <div className="text-sm opacity-90">Pontos</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">{userStats.games_played}</div>
                  <div className="text-sm opacity-90">Jogos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-red-200 mb-6">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-red-400" />
            <p className="text-red-600 font-medium mb-2">Erro ao carregar dados</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline" size="sm">
              🔄 Tentar novamente
            </Button>
          </div>
        )}

        {/* Competitions Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Desafios Diários Ativos ({competitions.length})
          </h2>

          {competitions.length === 0 ? (
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 font-medium mb-2">Nenhum desafio ativo</p>
              <p className="text-sm text-gray-500 mb-4">
                Aguarde novos desafios diários serem criados.
              </p>
              <Button onClick={loadData} variant="outline" size="sm">
                🔄 Verificar novamente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {competitions.map((competition) => (
                <Card key={competition.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {competition.title}
                        </h3>
                        {competition.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {competition.description}
                          </p>
                        )}
                        {competition.theme && (
                          <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-3">
                            Tema: {competition.theme}
                          </div>
                        )}
                      </div>
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        Ativo
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                          {competition.prize_pool ? `R$ ${competition.prize_pool.toFixed(2)}` : 'Sem prêmio'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">
                          {competition.max_participants || 'Ilimitado'} vagas
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-orange-600 font-medium">
                        {formatTimeRemaining(competition.end_date)}
                      </span>
                    </div>

                    <Button 
                      onClick={() => onStartChallenge(parseInt(competition.id))}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Participar do Desafio
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Ranking Preview */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-900">Ranking</CardTitle>
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Veja sua posição nos rankings diários e semanais
              </p>
              <Button 
                onClick={onViewFullRanking}
                variant="outline" 
                className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 font-medium"
              >
                Ver Rankings Completos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeScreen;
