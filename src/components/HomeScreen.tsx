
import React, { useEffect, useState } from 'react';
import { Trophy, Calendar, Users, Clock, Target, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dailyCompetitionService } from '@/services/dailyCompetitionService';
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

interface HomeScreenProps {
  onStartChallenge: (challengeId: number) => void;
  onViewFullRanking: () => void;
  onViewChallengeRanking: (challengeId: number) => void;
}

const HomeScreen = ({ onStartChallenge }: HomeScreenProps) => {
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
  }, []);

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
          <p className="text-gray-600">Carregando competições...</p>
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

        {/* Error State */}
        {error && (
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-red-200 mb-6">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-red-400" />
            <p className="text-red-600 font-medium mb-2">Erro ao carregar competições</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Button onClick={loadCompetitions} variant="outline" size="sm">
              🔄 Tentar novamente
            </Button>
          </div>
        )}

        {/* Daily Competitions Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Desafios Diários Disponíveis ({competitions.length})
          </h2>

          {competitions.length === 0 ? (
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 font-medium mb-2">Nenhum desafio disponível</p>
              <p className="text-sm text-gray-500 mb-4">
                Aguarde novos desafios diários serem criados.
              </p>
              <Button onClick={loadCompetitions} variant="outline" size="sm">
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
      </div>
    </div>
  );
};

export default HomeScreen;
