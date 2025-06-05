import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, User, History, CheckCircle, Clock, DollarSign, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ShareResultModal from './ShareResultModal';

interface Player {
  id: number;
  name: string;
  score: number;
  position: number;
  avatar?: string;
}

interface CompetitionHistory {
  id: string;
  weekStart: string;
  weekEnd: string;
  userPosition: number;
  userScore: number;
  totalParticipants: number;
  prize?: number;
  paymentStatus?: 'pending' | 'paid' | 'not_eligible';
  paymentDate?: string;
}

const RankingScreen = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [shareModalData, setShareModalData] = useState<any>(null);

  const dailyRanking: Player[] = [
    { id: 1, name: "João Silva", score: 2540, position: 1 },
    { id: 2, name: "Maria Santos", score: 2410, position: 2 },
    { id: 3, name: "Pedro Costa", score: 2380, position: 3 },
    { id: 4, name: "Ana Oliveira", score: 2220, position: 4 },
    { id: 5, name: "Carlos Mendes", score: 2180, position: 5 },
    { id: 6, name: "Lucia Ferreira", score: 2150, position: 6 },
    { id: 7, name: "Roberto Lima", score: 2120, position: 7 },
    { id: 8, name: "Fernanda Rocha", score: 2090, position: 8 },
    { id: 9, name: "Marcos Souza", score: 2050, position: 9 },
    { id: 10, name: "Patricia Dias", score: 2020, position: 10 },
  ];

  const weeklyRanking: Player[] = [
    { id: 1, name: "Maria Santos", score: 15420, position: 1 },
    { id: 2, name: "João Silva", score: 14890, position: 2 },
    { id: 3, name: "Carlos Mendes", score: 14650, position: 3 },
    { id: 4, name: "Ana Oliveira", score: 14200, position: 4 },
    { id: 5, name: "Pedro Costa", score: 13980, position: 5 },
    { id: 6, name: "Lucia Ferreira", score: 13750, position: 6 },
    { id: 7, name: "Roberto Lima", score: 13500, position: 7 },
    { id: 8, name: "Fernanda Rocha", score: 13280, position: 8 },
    { id: 9, name: "Marcos Souza", score: 13050, position: 9 },
    { id: 10, name: "Patricia Dias", score: 12820, position: 10 },
  ];

  const competitionHistory: CompetitionHistory[] = [
    {
      id: '2024-w02',
      weekStart: '2024-01-08',
      weekEnd: '2024-01-14',
      userPosition: 2,
      userScore: 14850,
      totalParticipants: 1247,
      prize: 500,
      paymentStatus: 'paid',
      paymentDate: '2024-01-16'
    },
    {
      id: '2024-w01',
      weekStart: '2024-01-01',
      weekEnd: '2024-01-07',
      userPosition: 15,
      userScore: 12340,
      totalParticipants: 982,
      paymentStatus: 'not_eligible'
    },
    {
      id: '2023-w52',
      weekStart: '2023-12-25',
      weekEnd: '2023-12-31',
      userPosition: 8,
      userScore: 13200,
      totalParticipants: 1105,
      prize: 50,
      paymentStatus: 'pending'
    },
    {
      id: '2023-w51',
      weekStart: '2023-12-18',
      weekEnd: '2023-12-24',
      userPosition: 42,
      userScore: 9850,
      totalParticipants: 1328,
      paymentStatus: 'not_eligible'
    },
    {
      id: '2023-w50',
      weekStart: '2023-12-11',
      weekEnd: '2023-12-17',
      userPosition: 3,
      userScore: 15620,
      totalParticipants: 1456,
      prize: 250,
      paymentStatus: 'paid',
      paymentDate: '2023-12-19'
    }
  ];

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">{position}</div>;
    }
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const PlayerRow = ({ player, isCurrentUser = false }: { player: Player; isCurrentUser?: boolean }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg border-2 ${getPositionStyle(player.position)} ${isCurrentUser ? 'ring-2 ring-purple-500' : ''}`}>
      <div className="flex items-center gap-3">
        {getRankIcon(player.position)}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-800">{player.name}</div>
            {isCurrentUser && <div className="text-xs text-purple-600 font-medium">Você</div>}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-purple-600">{player.score.toLocaleString()}pts</div>
        <div className="text-xs text-gray-500">#{player.position}</div>
      </div>
    </div>
  );

  const getCompetitionBadge = (position: number) => {
    if (position === 1) return 'bg-yellow-500 text-white';
    if (position === 2) return 'bg-gray-400 text-white';
    if (position === 3) return 'bg-orange-500 text-white';
    if (position <= 10) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-600';
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  };

  const CompetitionHistoryCard = ({ competition }: { competition: CompetitionHistory }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">Semana {competition.id.split('-w')[1]}</h3>
            <p className="text-sm text-gray-500">{formatDateRange(competition.weekStart, competition.weekEnd)}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getCompetitionBadge(competition.userPosition)}`}>
              #{competition.userPosition}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalData(competition)}
              className="h-8 w-8 p-0"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Pontuação:</span>
            <span className="font-semibold text-purple-600">{competition.userScore.toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-500">
            de {competition.totalParticipants.toLocaleString()} jogadores
          </div>
        </div>

        {competition.prize && (
          <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Prêmio: R$ {competition.prize.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getPaymentStatusIcon(competition.paymentStatus!)}
                <span className={`text-xs font-medium ${
                  competition.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {competition.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                </span>
              </div>
            </div>
            {competition.paymentStatus === 'paid' && competition.paymentDate && (
              <p className="text-xs text-green-600 mt-1">
                Pago em {new Date(competition.paymentDate).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-purple-800 mb-2">Rankings</h1>
        <p className="text-gray-600">Compete com jogadores do mundo todo</p>
      </div>

      {/* Prize Pool Card */}
      <Card className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
        <CardContent className="p-4 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2" />
          <div className="text-lg font-bold">Prêmio Semanal</div>
          <div className="text-2xl font-bold">R$ 500,00</div>
          <div className="text-sm opacity-80">Para os Top 3 da semana</div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="daily">Diário</TabsTrigger>
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Ranking Diário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dailyRanking.slice(0, 10).map((player) => (
                <PlayerRow key={player.id} player={player} />
              ))}
              
              {/* Current user position if not in top 10 */}
              <div className="border-t pt-3 mt-4">
                <PlayerRow 
                  player={{ id: 999, name: "Você", score: 1850, position: 42 }}
                  isCurrentUser={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-500" />
                Ranking Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weeklyRanking.slice(0, 10).map((player) => (
                <PlayerRow key={player.id} player={player} />
              ))}
              
              {/* Current user position if not in top 10 */}
              <div className="border-t pt-3 mt-4">
                <PlayerRow 
                  player={{ id: 999, name: "Você", score: 8950, position: 38 }}
                  isCurrentUser={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-purple-500" />
                Histórico de Competições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {competitionHistory.map((competition) => (
                  <CompetitionHistoryCard key={competition.id} competition={competition} />
                ))}
              </div>
              
              {competitionHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma competição encontrada</p>
                  <p className="text-sm">Participe das competições semanais para ver seu histórico aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de compartilhamento */}
      {shareModalData && (
        <ShareResultModal
          competition={shareModalData}
          onClose={() => setShareModalData(null)}
        />
      )}
    </div>
  );
};

export default RankingScreen;
