
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  BarChart3, 
  Trophy, 
  Medal, 
  Award, 
  Users, 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw,
  Crown
} from 'lucide-react';
import { useRankings } from '@/hooks/useRankings';
import { rankingExportService } from '@/services/rankingExportService';

const getRankingIcon = (position: number) => {
  switch (position) {
    case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2: return <Medal className="w-5 h-5 text-gray-400" />;
    case 3: return <Award className="w-5 h-5 text-orange-500" />;
    default: return (
      <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600 bg-gray-100 rounded-full">
        {position}
      </div>
    );
  }
};

const getRankingColors = (position: number) => {
  switch (position) {
    case 1: return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
    case 2: return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
    case 3: return "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200";
    default: return "bg-white border-gray-200";
  }
};

export const RankingsTab = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('daily');
  const { 
    dailyRanking, 
    weeklyRanking, 
    totalPlayers, 
    isLoading, 
    refreshData 
  } = useRankings();

  const handleRefresh = async () => {
    await refreshData();
    toast({
      title: "Dados atualizados",
      description: "Rankings foram atualizados com sucesso.",
    });
  };

  const handleExport = async () => {
    try {
      if (activeTab === 'daily') {
        const data = await rankingExportService.exportDailyRankings();
        rankingExportService.exportToCSV(data, `ranking_diario_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        const data = await rankingExportService.exportWeeklyRankings();
        rankingExportService.exportToCSV(data, `ranking_semanal_${new Date().toISOString().split('T')[0]}.csv`);
      }
      
      toast({
        title: "Exportação concluída",
        description: "Ranking exportado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o ranking.",
        variant: "destructive",
      });
    }
  };

  const currentRanking = activeTab === 'daily' ? dailyRanking : weeklyRanking;
  const activeCompetitions = activeTab === 'daily' ? 1 : 1; // Can be made dynamic later

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Trophy className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Rankings Globais</h1>
                  <p className="text-blue-100 mt-1">Acompanhe o desempenho dos jogadores em tempo real</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleExport}
                disabled={isLoading || currentRanking.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5" />
                <span className="font-semibold">Jogadores Ativos</span>
              </div>
              <div className="text-2xl font-bold">{totalPlayers.toLocaleString()}</div>
              <div className="text-sm text-blue-100">Com pontuação</div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="font-semibold">Competições</span>
              </div>
              <div className="text-2xl font-bold">{activeCompetitions}</div>
              <div className="text-sm text-blue-100">Ativas esta semana</div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5" />
                <span className="font-semibold">Última Atualização</span>
              </div>
              <div className="text-2xl font-bold">Agora</div>
              <div className="text-sm text-blue-100">Dados em tempo real</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList className="bg-white shadow-md border border-gray-200 p-1">
            <TabsTrigger 
              value="daily" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Ranking Diário
            </TabsTrigger>
            <TabsTrigger 
              value="weekly"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Ranking Semanal
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Atualizado em tempo real
          </div>
        </div>

        <TabsContent value="daily" className="space-y-4 mt-0">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-800">Ranking Diário</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Top jogadores de hoje</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {dailyRanking.length} participantes
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Carregando rankings...</span>
                </div>
              ) : dailyRanking.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-gray-600">Nenhum ranking disponível para hoje</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {dailyRanking.map((player) => (
                    <div 
                      key={player.user_id} 
                      className={`flex items-center gap-4 p-4 border-l-4 hover:shadow-md transition-all ${getRankingColors(player.pos)}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center">
                          {getRankingIcon(player.pos)}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {player.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{player.name}</p>
                            <p className="text-sm text-gray-500">Posição #{player.pos}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600">
                            {player.score.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">pontos</p>
                        </div>
                        
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {player.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4 mt-0">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-800">Ranking Semanal</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Top jogadores desta semana</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  {weeklyRanking.length} participantes
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Carregando rankings...</span>
                </div>
              ) : weeklyRanking.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-gray-600">Nenhum ranking disponível para esta semana</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {weeklyRanking.map((player) => (
                    <div 
                      key={player.user_id} 
                      className={`flex items-center gap-4 p-4 border-l-4 hover:shadow-md transition-all ${getRankingColors(player.pos)}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center">
                          {getRankingIcon(player.pos)}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {player.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{player.name}</p>
                            <p className="text-sm text-gray-500">Posição #{player.pos}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600">
                            {player.score.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">pontos</p>
                        </div>
                        
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {player.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Informações sobre Rankings</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Rankings são atualizados automaticamente em tempo real</li>
                <li>• Dados são carregados diretamente do banco de dados</li>
                <li>• Rankings diários são resetados a cada 24 horas às 00:00</li>
                <li>• Rankings semanais são resetados toda segunda-feira</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
