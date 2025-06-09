
import React, { useEffect } from 'react';
import { Trophy, Calendar, Users, Clock } from 'lucide-react';
import UserStatsCard from './home/UserStatsCard';
import RankingPreview from './home/RankingPreview';
import { useDailyCompetitions } from '@/hooks/useDailyCompetitions';
import { Button } from '@/components/ui/button';

interface HomeScreenProps {
  onStartChallenge: (challengeId: number) => void;
  onViewFullRanking: () => void;
  onViewChallengeRanking: (challengeId: number) => void;
}

const HomeScreen = ({ onViewFullRanking, onStartChallenge }: HomeScreenProps) => {
  const { activeCompetitions, isLoading, error, refetch } = useDailyCompetitions();

  useEffect(() => {
    console.log('🏠 HomeScreen montado, forçando busca de competições...');
    // Forçar uma nova busca sempre que o componente montar
    const fetchData = async () => {
      console.log('🔄 Executando refetch das competições...');
      await refetch();
    };
    fetchData();
  }, [refetch]);

  useEffect(() => {
    console.log('🔄 Estado das competições atualizou:', {
      isLoading,
      error,
      competitionsCount: activeCompetitions.length,
      competitions: activeCompetitions
    });
  }, [isLoading, error, activeCompetitions]);

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

        {/* User Stats */}
        <UserStatsCard />

        {/* Daily Competitions Section */}
        <div className="mt-8">
          {isLoading && (
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-gray-600">Carregando desafios...</p>
            </div>
          )}

          {error && (
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-red-200">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-red-400" />
              <p className="text-red-600 font-medium mb-2">Erro ao carregar desafios</p>
              <p className="text-sm text-red-500 mb-4">{error}</p>
              <Button onClick={() => {
                console.log('🔄 Botão "Tentar novamente" clicado');
                refetch();
              }} variant="outline" size="sm">
                🔄 Tentar novamente
              </Button>
            </div>
          )}

          {!isLoading && !error && activeCompetitions.length === 0 && (
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 font-medium mb-2">Nenhum desafio ativo hoje</p>
              <p className="text-sm text-gray-500 mb-4">
                Aguarde novos desafios diários serem criados pelo administrador.
              </p>
              <Button onClick={() => {
                console.log('🔄 Botão "Verificar novamente" clicado');
                refetch();
              }} variant="outline" size="sm">
                🔄 Verificar novamente
              </Button>
            </div>
          )}

          {!isLoading && !error && activeCompetitions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Desafios Diários Ativos ({activeCompetitions.length})
              </h2>
              {activeCompetitions.map((competition) => (
                <div key={competition.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ranking Preview */}
        <RankingPreview onViewFullRanking={onViewFullRanking} />
      </div>
    </div>
  );
};

export default HomeScreen;
