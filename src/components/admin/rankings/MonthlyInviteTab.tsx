import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMonthlyInviteCompetitionSimplified } from '@/hooks/useMonthlyInviteCompetitionSimplified';
import { MonthlyInviteHeader } from './monthly-invite/MonthlyInviteHeader';
import { MonthlyInviteStatsCards } from './monthly-invite/MonthlyInviteStatsCards';
import { MonthlyInviteRankingTable } from './monthly-invite/MonthlyInviteRankingTable';
import { MonthlyPrizeConfigModal } from './monthly-invite/MonthlyPrizeConfigModal';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Trophy, Users, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const MonthlyInviteTab = () => {
  const { data, isLoading, error, refreshRanking, refetch } = useMonthlyInviteCompetitionSimplified();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPrizeConfig, setShowPrizeConfig] = useState(false);
  const { toast } = useToast();

  const handleRefreshRanking = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshRanking();
      if (result?.success) {
        toast({
          title: "Ranking Atualizado",
          description: "O ranking mensal foi atualizado com sucesso.",
        });
      } else {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch (error) {
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar o ranking.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportWinners = () => {
    if (!data?.rankings || data.rankings.length === 0) {
      toast({
        title: "Nenhum Dado",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    const winners = data.rankings.filter((r: any) => r.prize_amount > 0);
    const csvContent = [
      ['Posição', 'Usuário', 'Pontos', 'Convites', 'Prêmio', 'Status', 'Chave PIX', 'Nome PIX'],
      ...winners.map((winner: any) => [
        winner.position,
        winner.username,
        winner.invite_points,
        winner.invites_count,
        `R$ ${winner.prize_amount}`,
        winner.payment_status,
        winner.pix_key || '',
        winner.pix_holder_name || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ranking-mensal-indicacoes-${new Date().toISOString().slice(0, 7)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exportação Concluída",
      description: "Lista de ganhadores exportada com sucesso.",
    });
  };

  // Loading skeleton seguindo padrão do WeeklyRankingView
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao Carregar Dados</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={refetch}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // Verificar se existe uma competição configurada
  if (!data?.competition) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma Competição Configurada</h3>
        <p className="text-gray-600 mb-4">Não foi possível encontrar ou criar a competição mensal</p>
        <Button onClick={refetch}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const { competition, rankings, stats } = data;
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const hasParticipants = data.has_participants || (rankings && rankings.length > 0);

  // Exibir card informativo quando não há participantes
  const NoParticipantsCard = () => (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Users className="h-5 w-5" />
          Aguardando Participantes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-blue-700">
            A competição está configurada e ativa, mas ainda não há participantes com convites utilizados.
          </p>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Gift className="h-4 w-4" />
            <span>Configure os prêmios clicando no botão "Configurar Prêmios"</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Trophy className="h-4 w-4" />
            <span>Os participantes aparecerão assim que utilizarem códigos de convite</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <MonthlyInviteHeader
        currentMonth={currentMonth}
        isRefreshing={isRefreshing}
        onRefreshRanking={handleRefreshRanking}
        onExportWinners={exportWinners}
        onConfigurePrizes={() => setShowPrizeConfig(true)}
      />

      <MonthlyInviteStatsCards
        stats={stats}
        rankings={rankings}
        competition={competition}
        onRefresh={refetch}
      />

      {!hasParticipants && <NoParticipantsCard />}

      <MonthlyInviteRankingTable rankings={rankings} />

      <MonthlyPrizeConfigModal
        open={showPrizeConfig}
        onOpenChange={setShowPrizeConfig}
        competitionId={competition?.id}
      />
    </div>
  );
};
